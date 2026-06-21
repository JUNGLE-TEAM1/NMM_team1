const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = process.env.NOTION_VERSION || "2022-06-28";
const SYNC_GRACE_MS = Number(process.env.SYNC_GRACE_MS || 30_000);
const DEFAULT_RECENT_GITHUB_CHANGE_MS = 15 * 60 * 1000;
const NOTION_SYNC_MARKER_RE = /<!--\s*notion-sync:page-id=([a-zA-Z0-9-]+)\s*-->/i;

module.exports = async function sync({ github, context, core }) {
  const config = buildConfig(context);
  const notion = createNotionClient(config);

  core.info(`Syncing ${config.repoFullName} with GitHub Project ${config.projectOwner}/${config.projectNumber}`);

  const project = await fetchProject({ github, config });
  const projectIssues = normalizeProjectIssues(project, config);
  const notionRows = await fetchNotionRows({ notion, config });
  const notionByIssueUrl = new Map();

  for (const row of notionRows) {
    if (row.issueUrl) {
      notionByIssueUrl.set(row.issueUrl, row);
    }
  }

  const seenNotionPages = new Set();
  let createdNotion = 0;
  let updatedNotion = 0;
  let updatedGitHub = 0;
  let createdIssues = 0;
  let addedToProject = 0;
  let reopenedProjectItems = 0;
  let removedProjectItems = 0;
  let archivedNotion = 0;
  let updatedMarkers = 0;

  const deletedIssue = issueFromDeletedEvent(context, config);
  if (deletedIssue) {
    const row = notionByIssueUrl.get(deletedIssue.issueUrl);
    if (row) {
      await archiveNotionPage({ notion, pageId: row.pageId });
      seenNotionPages.add(row.pageId);
      archivedNotion += 1;
    }
  }

  const reopenedIssue = issueFromReopenedEvent(context, config);
  if (reopenedIssue && !projectIssues.some((issue) => issue.issueUrl === reopenedIssue.issueUrl)) {
    const row = notionByIssueUrl.get(reopenedIssue.issueUrl);
    const projectIssue = await ensureProjectItem({
      github,
      config,
      project,
      issue: reopenedIssue,
      wantedStatus: config.reopenedProjectStatus,
    });
    reopenedProjectItems += 1;

    if (row && !isDeletedNotionRow(row)) {
      seenNotionPages.add(row.pageId);
      if (await ensureGitHubIssueHasNotionMarker({ github, config, issue: projectIssue, pageId: row.pageId })) {
        updatedMarkers += 1;
      }
      await updateNotionIssuePage({ notion, config, pageId: row.pageId, issue: projectIssue, source: "GitHub" });
      updatedNotion += 1;
    }
  }

  for (const issue of projectIssues) {
    const row = notionByIssueUrl.get(issue.issueUrl);

    if (issue.state === "closed") {
      if (row) {
        seenNotionPages.add(row.pageId);
        if (!isDeletedNotionRow(row)) {
          await archiveNotionPage({ notion, pageId: row.pageId });
          archivedNotion += 1;
        }
      }
      if (await removeProjectItem({ github, project, projectItemId: issue.projectItemId })) {
        removedProjectItems += 1;
      }
      if (await removeGitHubIssueNotionMarker({ github, config, issue })) {
        updatedMarkers += 1;
      }
      continue;
    }

    if (!row) {
      if (issue.notionPageId || !isRecentGitHubProjectChange(issue, config)) {
        if (await removeProjectItem({ github, project, projectItemId: issue.projectItemId })) {
          removedProjectItems += 1;
        }
        if (await removeGitHubIssueNotionMarker({ github, config, issue })) {
          updatedMarkers += 1;
        }
        continue;
      }

      const page = await createNotionIssuePage({ notion, config, issue, source: "GitHub" });
      if (await ensureGitHubIssueHasNotionMarker({ github, config, issue, pageId: page.id })) {
        updatedMarkers += 1;
      }
      createdNotion += 1;
      continue;
    }

    seenNotionPages.add(row.pageId);
    if (await ensureGitHubIssueHasNotionMarker({ github, config, issue, pageId: row.pageId })) {
      updatedMarkers += 1;
    }

    if (isDeletedNotionRow(row)) {
      if (await removeProjectItem({ github, project, projectItemId: issue.projectItemId })) {
        removedProjectItems += 1;
      }
      if (await removeGitHubIssueNotionMarker({ github, config, issue })) {
        updatedMarkers += 1;
      }
      continue;
    }

    const direction = chooseSyncDirection({ row, issue });
    if (direction === "notion") {
      await syncNotionToGitHub({ github, notion, config, project, row, issue });
      updatedGitHub += 1;
    } else if (direction === "github") {
      await updateNotionIssuePage({ notion, config, pageId: row.pageId, issue, source: "GitHub" });
      updatedNotion += 1;
    }
  }

  for (const row of notionRows) {
    if (seenNotionPages.has(row.pageId)) {
      continue;
    }

    if (row.issueUrl) {
      const parsed = parseIssueUrl(row.issueUrl);
      if (!parsed || parsed.owner !== config.owner || parsed.repo !== config.repo) {
        continue;
      }

      const issue = await fetchGitHubIssueOrNull({ github, config, issueNumber: parsed.number });
      if (!issue) {
        await archiveNotionPage({ notion, pageId: row.pageId });
        archivedNotion += 1;
        continue;
      }

      if (issue.state === "closed") {
        if (!isDeletedNotionRow(row)) {
          await archiveNotionPage({ notion, pageId: row.pageId });
          archivedNotion += 1;
        }
        if (await removeGitHubIssueNotionMarker({ github, config, issue })) {
          updatedMarkers += 1;
        }
        continue;
      }

      if (shouldArchiveNotionMissingFromProject(row)) {
        if (!isDeletedNotionRow(row)) {
          await archiveNotionPage({ notion, pageId: row.pageId });
          archivedNotion += 1;
        }
        if (await removeGitHubIssueNotionMarker({ github, config, issue })) {
          updatedMarkers += 1;
        }
        continue;
      }

      const projectIssue = await ensureProjectItem({ github, config, project, issue, wantedStatus: row.projectStatus });
      if (await ensureGitHubIssueHasNotionMarker({ github, config, issue: projectIssue, pageId: row.pageId })) {
        updatedMarkers += 1;
      }
      await updateNotionIssuePage({ notion, config, pageId: row.pageId, issue: projectIssue, source: "GitHub" });
      addedToProject += 1;
      continue;
    }

    if (row.repoUrl === config.repoUrl && row.notionTitle) {
      const issue = await createGitHubIssueFromNotion({ github, config, row });
      const projectIssue = await ensureProjectItem({ github, config, project, issue, wantedStatus: row.projectStatus });
      await updateNotionIssuePage({ notion, config, pageId: row.pageId, issue: projectIssue, source: "Notion" });
      createdIssues += 1;
    }
  }

  core.info(
    [
      `Created Notion pages: ${createdNotion}`,
      `Updated Notion pages: ${updatedNotion}`,
      `Updated GitHub issues/project items: ${updatedGitHub}`,
      `Created GitHub issues from Notion: ${createdIssues}`,
      `Added existing issues to project: ${addedToProject}`,
      `Reopened GitHub issues re-added to project: ${reopenedProjectItems}`,
      `Removed GitHub Project items: ${removedProjectItems}`,
      `Archived Notion pages: ${archivedNotion}`,
      `Updated GitHub sync markers: ${updatedMarkers}`,
    ].join("\n"),
  );
};

function buildConfig(context) {
  const notionToken = process.env.NOTION_TOKEN;
  const notionDatabaseId = process.env.NOTION_DATABASE_ID;

  if (!notionToken) {
    throw new Error("Missing NOTION_TOKEN secret.");
  }

  if (!notionDatabaseId) {
    throw new Error("Missing NOTION_DATABASE_ID secret.");
  }

  const owner = process.env.GITHUB_REPOSITORY_OWNER || context.repo.owner;
  const repo = context.repo.repo;
  const projectOwner = process.env.GITHUB_PROJECT_OWNER || owner;
  const projectNumber = Number(process.env.GITHUB_PROJECT_NUMBER || 3);

  if (!Number.isInteger(projectNumber) || projectNumber < 1) {
    throw new Error(`Invalid GITHUB_PROJECT_NUMBER: ${process.env.GITHUB_PROJECT_NUMBER}`);
  }

  return {
    notionToken,
    notionDatabaseId,
    owner,
    repo,
    repoFullName: `${owner}/${repo}`,
    repoUrl: `https://github.com/${owner}/${repo}`,
    projectOwner,
    projectNumber,
    githubStatusField: process.env.GITHUB_PROJECT_STATUS_FIELD || "Status",
    reopenedProjectStatus: process.env.GITHUB_PROJECT_REOPENED_STATUS || "Ready",
    recentGitHubChangeMs: parsePositiveNumber(process.env.GITHUB_RECENT_CHANGE_MS, DEFAULT_RECENT_GITHUB_CHANGE_MS),
    fallbackStatusOptionIds: parseStatusOptionIds(process.env.GITHUB_PROJECT_STATUS_OPTION_IDS),
    projectStatusAliases: parseStatusAliases(process.env.GITHUB_PROJECT_STATUS_ALIASES),
    props: {
      title: process.env.NOTION_TITLE_PROPERTY || "Issue",
      issueUrl: process.env.NOTION_ISSUE_URL_PROPERTY || "Issue URL",
      repo: process.env.NOTION_REPO_PROPERTY || "Repo",
      state: process.env.NOTION_STATE_PROPERTY || "State",
      number: process.env.NOTION_NUMBER_PROPERTY || "Number",
      labels: process.env.NOTION_LABELS_PROPERTY || "Labels",
      assignees: process.env.NOTION_ASSIGNEES_PROPERTY || "Assignees",
      projectStatus: process.env.NOTION_PROJECT_STATUS_PROPERTY || "Project Status",
      created: process.env.NOTION_CREATED_PROPERTY || "Created",
      updated: process.env.NOTION_UPDATED_PROPERTY || "Updated",
      lastGitHubUpdated: process.env.NOTION_LAST_GITHUB_UPDATED_PROPERTY || "Last GitHub Updated",
      lastSyncedAt: process.env.NOTION_LAST_SYNCED_AT_PROPERTY || "Last Synced At",
      lastSyncSource: process.env.NOTION_LAST_SYNC_SOURCE_PROPERTY || "Last Sync Source",
      syncError: process.env.NOTION_SYNC_ERROR_PROPERTY || "Sync Error",
    },
  };
}

function createNotionClient(config) {
  return async function notionRequest(path, options = {}) {
    const response = await fetch(`${NOTION_API_BASE}${path}`, {
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${config.notionToken}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Notion API ${response.status} ${response.statusText}: ${text}`);
    }

    return response.json();
  };
}

async function fetchProject({ github, config }) {
  const query = `
    query($owner: String!, $number: Int!, $after: String) {
      organization(login: $owner) {
        projectV2(number: $number) {
          ...ProjectParts
        }
      }
    }

    fragment ProjectParts on ProjectV2 {
      id
      title
      fields(first: 100) {
        nodes {
          ... on ProjectV2Field {
            id
            name
            dataType
          }
          ... on ProjectV2SingleSelectField {
            id
            name
            dataType
            options {
              id
              name
            }
          }
          ... on ProjectV2IterationField {
            id
            name
            dataType
          }
        }
      }
      items(first: 100, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          createdAt
          updatedAt
          content {
            ... on Issue {
              id
              number
              title
              state
              url
              body
              createdAt
              updatedAt
              repository {
                name
                nameWithOwner
                url
                owner {
                  login
                }
              }
              assignees(first: 50) {
                nodes {
                  login
                }
              }
              labels(first: 50) {
                nodes {
                  name
                }
              }
            }
          }
          fieldValues(first: 100) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                optionId
                updatedAt
                field {
                  ... on ProjectV2FieldCommon {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  let project = null;
  let after = null;
  const items = [];

  do {
    const result = await github.graphql(query, {
      owner: config.projectOwner,
      number: config.projectNumber,
      after,
    });

    const pageProject = result.organization?.projectV2;
    if (!pageProject) {
      throw new Error(`Could not find organization project ${config.projectOwner}/${config.projectNumber}.`);
    }

    if (!project) {
      project = pageProject;
    }

    items.push(...pageProject.items.nodes);
    after = pageProject.items.pageInfo.hasNextPage ? pageProject.items.pageInfo.endCursor : null;
  } while (after);

  const statusField = project.fields.nodes.find((field) => field?.name === config.githubStatusField);
  if (!statusField) {
    throw new Error(`Project field "${config.githubStatusField}" was not found.`);
  }

  return {
    id: project.id,
    title: project.title,
    fields: project.fields.nodes,
    items,
    statusField,
    fallbackStatusOptionIds: config.fallbackStatusOptionIds,
    projectStatusAliases: config.projectStatusAliases,
    statusOptionsByName: new Map(
      (statusField.options || []).map((option) => [normalizeProjectStatusName(option.name), option]),
    ),
  };
}

function normalizeProjectIssues(project, config) {
  return project.items
    .filter((item) => item.content?.repository?.nameWithOwner === config.repoFullName)
    .map((item) => normalizeProjectIssue({ item, project, config }));
}

function normalizeProjectIssue({ item, project, config }) {
  const issue = item.content;
  const statusValue = (item.fieldValues.nodes || []).find((value) => value?.field?.name === config.githubStatusField);
  const githubUpdatedAt = maxIso(issue.updatedAt, item.updatedAt, statusValue?.updatedAt);

  return {
    nodeId: issue.id,
    projectItemId: item.id,
    number: issue.number,
    title: issue.title,
    state: issue.state.toLowerCase(),
    issueUrl: issue.url,
    projectItemCreatedAt: item.createdAt,
    projectItemUpdatedAt: item.updatedAt,
    body: issue.body || "",
    notionPageId: readNotionPageIdFromIssueBody(issue.body),
    repoUrl: issue.repository.url,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    githubUpdatedAt,
    labels: issue.labels.nodes.map((label) => label.name),
    assignees: issue.assignees.nodes.map((assignee) => assignee.login),
    projectStatus: statusValue?.name || null,
    projectStatusOptionId: statusValue?.optionId || null,
  };
}

async function fetchNotionRows({ notion, config }) {
  const rows = [];
  let startCursor = undefined;

  do {
    const body = {
      page_size: 100,
      filter: {
        or: [
          {
            property: config.props.repo,
            url: {
              equals: config.repoUrl,
            },
          },
          {
            property: config.props.issueUrl,
            url: {
              contains: `${config.repoFullName}/issues/`,
            },
          },
        ],
      },
    };

    if (startCursor) {
      body.start_cursor = startCursor;
    }

    const page = await notion(`/databases/${config.notionDatabaseId}/query`, {
      method: "POST",
      body,
    });

    rows.push(...page.results.map((result) => normalizeNotionRow(result, config)));
    startCursor = page.has_more ? page.next_cursor : undefined;
  } while (startCursor);

  return rows;
}

function normalizeNotionRow(page, config) {
  const props = config.props;

  return {
    pageId: page.id,
    lastEditedAt: page.last_edited_time,
    notionTitle: readTitle(page, props.title),
    issueUrl: readUrl(page, props.issueUrl),
    repoUrl: readUrl(page, props.repo),
    state: normalizeState(readSelect(page, props.state)),
    number: readNumber(page, props.number),
    labels: splitList(readText(page, props.labels)),
    assignees: splitList(readText(page, props.assignees)),
    projectStatus: readSelect(page, props.projectStatus),
    lastGitHubUpdatedAt: readDate(page, props.lastGitHubUpdated),
    lastSyncedAt: readDate(page, props.lastSyncedAt),
    lastSyncSource: readSelect(page, props.lastSyncSource),
    archived: Boolean(page.archived),
    inTrash: Boolean(page.in_trash),
  };
}

function chooseSyncDirection({ row, issue }) {
  const githubChanged = !row.lastGitHubUpdatedAt || isAfter(issue.githubUpdatedAt, row.lastGitHubUpdatedAt);
  const notionChanged = row.lastSyncedAt && isAfter(row.lastEditedAt, row.lastSyncedAt);

  if (githubChanged && notionChanged) {
    return new Date(row.lastEditedAt).getTime() > new Date(issue.githubUpdatedAt).getTime() ? "notion" : "github";
  }

  if (notionChanged) {
    return "notion";
  }

  if (githubChanged) {
    return "github";
  }

  return "none";
}

async function syncNotionToGitHub({ github, notion, config, project, row, issue }) {
  const title = stripIssuePrefix(row.notionTitle, issue.number);
  const labels = row.labels;
  const assignees = row.assignees;

  const { data } = await github.rest.issues.update({
    owner: config.owner,
    repo: config.repo,
    issue_number: issue.number,
    title: title || issue.title,
    labels,
    assignees,
  });

  let projectStatus = issue.projectStatus;
  if (row.projectStatus && row.projectStatus !== issue.projectStatus) {
    const syncedStatus = await updateProjectStatus({
      github,
      project,
      projectItemId: issue.projectItemId,
      statusName: row.projectStatus,
    });
    projectStatus = syncedStatus || row.projectStatus;
  }

  const updatedIssue = {
    ...issue,
    title: data.title,
    state: data.state,
    labels: data.labels.map((label) => label.name),
    assignees: data.assignees.map((assignee) => assignee.login),
    updatedAt: data.updated_at,
    githubUpdatedAt: new Date().toISOString(),
    projectStatus,
  };

  await updateNotionIssuePage({ notion, config, pageId: row.pageId, issue: updatedIssue, source: "Notion" });
}

async function updateProjectStatus({ github, project, projectItemId, statusName }) {
  const normalizedStatusName = normalizeProjectStatusName(statusName);
  const aliasedStatusName = project.projectStatusAliases.get(normalizedStatusName) || statusName;
  const normalizedAliasedStatusName = normalizeProjectStatusName(aliasedStatusName);
  const option = project.statusOptionsByName.get(normalizedAliasedStatusName);
  const fallbackOptionId = project.fallbackStatusOptionIds?.get(normalizedAliasedStatusName);
  const optionId = option?.id || fallbackOptionId;

  if (!optionId) {
    const knownOptions = [...project.statusOptionsByName.keys()].join(", ") || "(none)";
    console.warn(`Skipping unknown project status "${statusName}". Known GitHub options: ${knownOptions}`);
    return null;
  }

  if (!option) {
    console.warn(`Using fallback option id for project status "${aliasedStatusName}".`);
  }

  await github.graphql(
    `
      mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
        updateProjectV2ItemFieldValue(
          input: {
            projectId: $projectId
            itemId: $itemId
            fieldId: $fieldId
            value: { singleSelectOptionId: $optionId }
          }
        ) {
          projectV2Item {
            id
          }
        }
      }
    `,
    {
      projectId: project.id,
      itemId: projectItemId,
      fieldId: project.statusField.id,
      optionId,
    },
  );

  return aliasedStatusName;
}

async function fetchGitHubIssue({ github, config, issueNumber }) {
  const { data } = await github.rest.issues.get({
    owner: config.owner,
    repo: config.repo,
    issue_number: issueNumber,
  });

  return issueFromRest(data, config);
}

async function fetchGitHubIssueOrNull({ github, config, issueNumber }) {
  try {
    return await fetchGitHubIssue({ github, config, issueNumber });
  } catch (error) {
    if (error.status === 404 || error.status === 410) {
      return null;
    }

    throw error;
  }
}

async function createGitHubIssueFromNotion({ github, config, row }) {
  const { data } = await github.rest.issues.create({
    owner: config.owner,
    repo: config.repo,
    title: stripIssuePrefix(row.notionTitle, row.number),
    body: buildNotionSyncMarker(row.pageId),
    labels: row.labels,
    assignees: row.assignees,
  });

  return issueFromRest(data, config);
}

async function ensureProjectItem({ github, config, project, issue, wantedStatus }) {
  const existing = project.items.find((item) => item.content?.url === issue.issueUrl);
  let projectItemId = existing?.id;

  if (!projectItemId) {
    const result = await github.graphql(
      `
        mutation($projectId: ID!, $contentId: ID!) {
          addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
            item {
              id
            }
          }
        }
      `,
      {
        projectId: project.id,
        contentId: issue.nodeId,
      },
    );

    projectItemId = result.addProjectV2ItemById.item.id;
  }

  if (wantedStatus) {
    await updateProjectStatus({
      github,
      project,
      projectItemId,
      statusName: wantedStatus,
    });
  }

  return {
    ...issue,
    projectItemId,
    projectStatus: wantedStatus || issue.projectStatus || null,
    githubUpdatedAt: new Date().toISOString(),
  };
}

async function removeProjectItem({ github, project, projectItemId }) {
  if (!projectItemId) {
    return false;
  }

  await github.graphql(
    `
      mutation($projectId: ID!, $itemId: ID!) {
        deleteProjectV2Item(input: { projectId: $projectId, itemId: $itemId }) {
          deletedItemId
        }
      }
    `,
    {
      projectId: project.id,
      itemId: projectItemId,
    },
  );

  return true;
}

function issueFromRest(issue, config) {
  return {
    nodeId: issue.node_id,
    projectItemId: null,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    issueUrl: issue.html_url,
    body: issue.body || "",
    notionPageId: readNotionPageIdFromIssueBody(issue.body),
    repoUrl: config.repoUrl,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    githubUpdatedAt: issue.updated_at,
    labels: issue.labels.map((label) => label.name),
    assignees: issue.assignees.map((assignee) => assignee.login),
    projectStatus: null,
    projectStatusOptionId: null,
  };
}

function issueFromDeletedEvent(context, config) {
  if (context.eventName !== "issues" || context.payload.action !== "deleted" || !context.payload.issue) {
    return null;
  }

  return issueFromWebhookIssue(context.payload.issue, config);
}

function issueFromReopenedEvent(context, config) {
  if (context.eventName !== "issues" || context.payload.action !== "reopened" || !context.payload.issue) {
    return null;
  }

  return issueFromWebhookIssue(context.payload.issue, config);
}

function issueFromWebhookIssue(issue, config) {
  return {
    nodeId: issue.node_id || null,
    projectItemId: null,
    number: issue.number,
    title: issue.title,
    state: issue.state || "open",
    issueUrl: issue.html_url,
    body: issue.body || "",
    notionPageId: readNotionPageIdFromIssueBody(issue.body),
    repoUrl: config.repoUrl,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    githubUpdatedAt: new Date().toISOString(),
    labels: (issue.labels || []).map((label) => label.name).filter(Boolean),
    assignees: (issue.assignees || []).map((assignee) => assignee.login).filter(Boolean),
    projectStatus: null,
    projectStatusOptionId: null,
  };
}

function isDeletedNotionRow(row) {
  return Boolean(row.archived || row.inTrash);
}

function shouldArchiveNotionMissingFromProject(row) {
  return Boolean(row.lastSyncedAt && !isAfter(row.lastEditedAt, row.lastSyncedAt));
}

function isRecentGitHubProjectChange(issue, config) {
  return isWithinMs(issue.projectItemCreatedAt, new Date().toISOString(), config.recentGitHubChangeMs);
}

async function ensureGitHubIssueHasNotionMarker({ github, config, issue, pageId }) {
  if (!pageId || issue.notionPageId === pageId) {
    return false;
  }

  const body = upsertNotionSyncMarker(issue.body, pageId);
  if (body === issue.body) {
    return false;
  }

  await github.rest.issues.update({
    owner: config.owner,
    repo: config.repo,
    issue_number: issue.number,
    body,
  });

  issue.body = body;
  issue.notionPageId = pageId;
  return true;
}

async function removeGitHubIssueNotionMarker({ github, config, issue }) {
  if (!issue.notionPageId) {
    return false;
  }

  const body = removeNotionSyncMarker(issue.body);
  if (body === issue.body) {
    issue.notionPageId = null;
    return false;
  }

  await github.rest.issues.update({
    owner: config.owner,
    repo: config.repo,
    issue_number: issue.number,
    body,
  });

  issue.body = body;
  issue.notionPageId = null;
  return true;
}

function readNotionPageIdFromIssueBody(body) {
  return NOTION_SYNC_MARKER_RE.exec(body || "")?.[1] || null;
}

function buildNotionSyncMarker(pageId) {
  return `<!-- notion-sync:page-id=${pageId} -->`;
}

function upsertNotionSyncMarker(body, pageId) {
  const marker = buildNotionSyncMarker(pageId);
  const content = body || "";

  if (NOTION_SYNC_MARKER_RE.test(content)) {
    return content.replace(NOTION_SYNC_MARKER_RE, marker);
  }

  return content ? `${content.trimEnd()}\n\n${marker}` : marker;
}

function removeNotionSyncMarker(body) {
  return (body || "")
    .replace(NOTION_SYNC_MARKER_RE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function createNotionIssuePage({ notion, config, issue, source }) {
  return notion("/pages", {
    method: "POST",
    body: {
      parent: {
        database_id: config.notionDatabaseId,
      },
      properties: buildNotionProperties({ config, issue, source }),
    },
  });
}

async function archiveNotionPage({ notion, pageId }) {
  return notion(`/pages/${pageId}`, {
    method: "PATCH",
    body: {
      archived: true,
    },
  });
}

async function updateNotionIssuePage({ notion, config, pageId, issue, source }) {
  return notion(`/pages/${pageId}`, {
    method: "PATCH",
    body: {
      properties: buildNotionProperties({ config, issue, source }),
    },
  });
}

function buildNotionProperties({ config, issue, source }) {
  const props = config.props;
  const now = new Date().toISOString();
  const properties = {
    [props.title]: titleValue(`#${issue.number} ${issue.title}`),
    [props.issueUrl]: urlValue(issue.issueUrl),
    [props.repo]: urlValue(issue.repoUrl || config.repoUrl),
    [props.state]: selectValue(issue.state),
    [props.number]: numberValue(issue.number),
    [props.labels]: richTextValue(issue.labels.join(", ")),
    [props.assignees]: richTextValue(issue.assignees.join(", ")),
    [props.created]: dateValue(issue.createdAt),
    [props.updated]: dateValue(issue.updatedAt),
    [props.lastGitHubUpdated]: dateValue(issue.githubUpdatedAt),
    [props.lastSyncedAt]: dateValue(now),
    [props.lastSyncSource]: selectValue(source),
    [props.syncError]: richTextValue(""),
  };

  if (issue.projectStatus) {
    properties[props.projectStatus] = selectValue(issue.projectStatus);
  }

  return properties;
}

function titleValue(content) {
  return {
    title: [
      {
        text: {
          content: content.slice(0, 2000),
        },
      },
    ],
  };
}

function richTextValue(content) {
  return {
    rich_text: content
      ? [
          {
            text: {
              content: content.slice(0, 2000),
            },
          },
        ]
      : [],
  };
}

function urlValue(url) {
  return {
    url: url || null,
  };
}

function selectValue(name) {
  return {
    select: name ? { name } : null,
  };
}

function numberValue(number) {
  return {
    number,
  };
}

function dateValue(iso) {
  return {
    date: iso ? { start: iso } : null,
  };
}

function readTitle(page, name) {
  const prop = page.properties?.[name];
  return (prop?.title || []).map((part) => part.plain_text).join("");
}

function readText(page, name) {
  const prop = page.properties?.[name];
  return (prop?.rich_text || []).map((part) => part.plain_text).join("");
}

function readUrl(page, name) {
  return page.properties?.[name]?.url || null;
}

function readSelect(page, name) {
  return page.properties?.[name]?.select?.name || null;
}

function readNumber(page, name) {
  return page.properties?.[name]?.number ?? null;
}

function readDate(page, name) {
  return page.properties?.[name]?.date?.start || null;
}

function splitList(value) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripIssuePrefix(title, number) {
  const escapedNumber = number ? String(number).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "\\d+";
  return (title || "").replace(new RegExp(`^#${escapedNumber}\\s+`), "").trim();
}

function normalizeState(value) {
  if (!value) {
    return null;
  }

  const state = value.toLowerCase();
  return state === "closed" ? "closed" : "open";
}

function parseIssueUrl(url) {
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/.exec(url || "");
  if (!match) {
    return null;
  }

  return {
    owner: match[1],
    repo: match[2],
    number: Number(match[3]),
  };
}

function parseStatusOptionIds(value) {
  return parseStatusMap(value);
}

function parseStatusAliases(value) {
  const aliases = parseStatusMap(value);

  if (!aliases.has(normalizeProjectStatusName("비전"))) {
    aliases.set(normalizeProjectStatusName("비전"), "Backlog");
  }

  return aliases;
}

function parseStatusMap(value) {
  const map = new Map();
  if (!value) {
    return map;
  }

  const parsed = JSON.parse(value);
  for (const [name, mappedValue] of Object.entries(parsed)) {
    map.set(normalizeProjectStatusName(name), mappedValue);
  }

  return map;
}

function normalizeProjectStatusName(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isAfter(left, right) {
  if (!left || !right) {
    return false;
  }

  return new Date(left).getTime() > new Date(right).getTime() + SYNC_GRACE_MS;
}

function isWithinMs(left, right, windowMs) {
  if (!left || !right) {
    return false;
  }

  const leftTime = new Date(left).getTime();
  const rightTime = new Date(right).getTime();
  if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) {
    return false;
  }

  return Math.abs(rightTime - leftTime) <= windowMs;
}

function maxIso(...values) {
  const times = values
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  if (!times.length) {
    return new Date().toISOString();
  }

  return new Date(Math.max(...times)).toISOString();
}

function parsePositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
