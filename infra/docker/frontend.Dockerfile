FROM nginx:1.27-alpine

RUN cat > /usr/share/nginx/html/index.html <<'HTML'
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <title>AskLake</title>
  </head>
  <body>
    <h1>AskLake frontend smoke</h1>
  </body>
</html>
HTML

EXPOSE 80

