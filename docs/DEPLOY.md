# Remote static site

The `dev/cocos` branch deploys to <https://hanhandi.cn/pixelfx_extend/index.html>.
The gallery and fantasy pages are bundled by `npm run build:web`;
build output stays ignored. The Docker build installs locked dependencies with
scripts disabled so it does not download the CLI-only ffmpeg binary.

## Layout

- Compose project/service: `pixelfx-extend` / `pixelfx`.
- Stable Compose file: `/home/ubuntu/code/pixelfx-extend/compose.yaml`.
- Git archives: `/home/ubuntu/code/pixelfx-extend/releases/<full-sha>/`.
- Image: `pixelfx-extend:<full-sha>`.
- Loopback listener: `127.0.0.1:3011`.
- OpenResty route: `/opt/1panel/www/sites/hanhandi/proxy/pixelfx_extend.conf`,
  sourced from `deploy/proxy.conf`.
- System Nginx routes `/pixelfx_extend/` to OpenResty at `127.0.0.1:18080`
  without stripping the prefix. OpenResty strips it before forwarding to port 3011.
- No secrets or persistent data are required by this static site.

## Release

Run the checks in `.codex/deploy.json`, commit and push to `origin/dev/cocos`.
Transfer only `git archive <full-sha>` to the release directory. Keep the stable
Compose file outside releases so the manager discovers exactly one project.
Save a copy of the active Compose file, deployment `.env`, and changed proxy
files before updating. Write these non-secret deployment selectors in the
stable directory's `.env`:

```dotenv
PIXELFX_IMAGE_TAG=<full-sha>
PIXELFX_BUILD_CONTEXT=/home/ubuntu/code/pixelfx-extend/releases/<full-sha>
```

From the stable directory run:

```sh
sudo docker compose config --quiet
sudo docker compose build pixelfx
sudo docker compose up -d --no-deps --wait --wait-timeout 90 pixelfx
```

After proxy edits, test and reload both proxies as applicable (system `nginx -t`
and `docker exec 1Panel-openresty-H2DB nginx -t`). Verify the public homepage,
JavaScript/CSS/fonts, fantasy page and `healthz`, then run:

```sh
cd /home/ubuntu/code
./compose-manager.py list
./compose-manager.py ps pixelfx-extend pixelfx
```

To roll back a later release, restore only this project's previous Compose and
deployment selectors, then run the same targeted `up` command with the previous
image. Restore only the route edits made by that release and test before reload.
Do not stop other Compose projects or remove their volumes.
