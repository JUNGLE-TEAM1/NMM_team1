# Frontend Shell Split 품질 기록

- Quality gate status: passed

## Executed Checks

```bash
npm --prefix frontend run build
git diff --check
```

## Result

- Frontend build: passed.
- Diff whitespace check: passed.
- Browser route smoke: passed with `VITE_PROXY_TARGET=http://127.0.0.1:8000`.

## Browser Smoke

- `/connections`
- `/datasets/source`
- `/datasets/silver`
- `/datasets/gold`
- `/jobs/silver-transform`
- `/jobs/gold-build`
- `/runs`
- `/catalog`
- `/query`
- `/`, `/datasets`, `/jobs` alias normalization

## Notes

- Initial dev server used the default Vite proxy target `http://127.0.0.1:18000` and showed HTTP 502 for API-backed panels.
- Re-ran browser smoke with `VITE_PROXY_TARGET=http://127.0.0.1:8000`; route shell, sidebar, active nav, and page surface rendered without console errors.
