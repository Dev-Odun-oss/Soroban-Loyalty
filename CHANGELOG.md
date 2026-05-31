# [1.50.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.49.0...v1.50.0) (2026-05-31)


### Features

* **backend:** add input validation middleware for campaign creation ([e67f848](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/e67f84834501057a12ebf413eff454f3c32b2e44)), closes [#282](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/282)
* **backend:** implement structured error handling middleware ([8fc62c2](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/8fc62c26d51c6e7087b4dc84e635122c1afa841d)), closes [#284](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/284)
* **frontend:** add loading skeletons to campaign list and reward list ([5388eac](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/5388eac0bbb1e07af0e8ff3459341afbd6b0dbe9)), closes [#281](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/281) [#283](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/283)

# [1.49.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.48.0...v1.49.0) (2026-05-31)


### Features

* **backend:** implement indexer checkpoint persistence ([32b6041](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/32b604147d05ffad4c013df5e636739c5db84cbf)), closes [#328](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/328)

# [1.48.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.47.1...v1.48.0) (2026-05-31)


### Features

* add loading spinner component for async actions ([14ae40e](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/14ae40e9b666b3c264c74c3ebdd4862cf14dfad6)), closes [#350](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/350)
* add reusable ConfirmModal component for destructive actions ([e98a178](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/e98a178ac3f8c965adfd46595b86950bc2cffb5a)), closes [#352](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/352)
* implement toast notification system ([71df087](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/71df087eaf740b328a64f41287e116b0909adcb4)), closes [#348](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/348)

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Toast notification system with success, error, warning, and info variants
- ConfirmModal component for destructive action confirmation
- Spinner component with loading states for async actions
- LoadingButton component with built-in loading state
- PageLoader component for full-page loading overlays

### Changed
- Improved accessibility with ARIA labels and keyboard navigation
- Enhanced error handling in async operations

### Fixed
- Screen reader announcements for dynamic content updates
- Focus trapping in modal dialogs

### Security
- No security changes in this release

## [1.47.1](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.47.0...v1.47.1) (2026-05-30)

### Bug Fixes
- **#374,#376:** Optimize Dockerfiles for production ([5cbbf08](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/5cbbf08dced2c3fef9aa5f72f87b9556dc76bd60)), closes [#374](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/374) [#376](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/376)
- **#378:** Add health check to frontend service in docker-compose ([4503063](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/45030638b31dcd0a2d799a74a461865863cbdbd8)), closes [#378](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/378)

## [1.47.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.46.0...v1.47.0) (2026-05-30)

### Features
- **backend:** add owner_address to campaigns table and routes ([ecaaba6](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/ecaaba6fcd7e1d059926bfb3e363e070c4b7bfdd)), closes [#325](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/325)

## [1.46.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.45.0...v1.46.0) (2026-05-30)

### Features
- **#383:** Add comprehensive RewardList component tests ([3e6b3a5](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/3e6b3a501537d918958d08024e905a62287c0b30)), closes [#383](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/383)
- **#384:** Add Rust contract build and test to CI ([ae48cff](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/ae48cffa4ddc22e2026d645ac71e7dbddc15e9ae)), closes [#384](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/384)
- **#385:** Add end-to-end test for claim reward flow ([c2ca3cb](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/c2ca3cb59bf8f43b36deece9a8e5cb20aa914821)), closes [#385](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/385)
- **#386:** Configure Nginx as reverse proxy for production ([e18375b](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/e18375b9e65973246d14f2cb533fff8f9fa6d23d)), closes [#386](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/386)
- add reusable ErrorState component with retry ([15197b6](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/15197b65c0117eb541ceea8ea40027c24643fd54))

## [1.45.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.44.0...v1.45.0) (2026-05-30)

### Features
- **#379, #381:** Add comprehensive unit tests for WalletContext and CampaignCard ([b5956aa](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/b5956aadd89430fbeb9bb8c73a0689aebd827112)), closes [#379](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/379) [#381](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/381)
- **#380, #382:** Add GitHub Actions CI and CD pipelines ([2a0dee5](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/2a0dee582ead7fb8c4ece268b2bfb74e5a061bee)), closes [#380](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/380) [#382](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/382)

## [1.44.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.43.0...v1.44.0) (2026-05-30)

### Features
- **backend:** add reusable Stellar address format validator ([a4050ac](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/a4050ac12a0b419729a403fc7b74ea7379e2408c)), closes [#326](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/326)
- **frontend:** implement dark mode toggle ([695d289](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/695d28920c8ef29d1f4f991611d67c757b019978)), closes [#327](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/327)

## [1.43.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.42.0...v1.43.0) (2026-05-29)

### Features
- **#358:** Add skeleton shimmer animation utility ([d643827](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/d643827eee94e7e58b84753bf14028b3678de49b)), closes [#358](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/358)
- **#364:** Implement responsive navigation drawer for mobile ([99db831](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/99db83151f2a8ab085eef6a056b2980202a1f837)), closes [#364](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/364)

## [1.42.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.41.0...v1.42.0) (2026-05-29)

### Bug Fixes
- **#371:** Audit and remove unused npm dependencies ([4a6b3d9](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/4a6b3d9f55c573df4366ebef3151d5ed794cbc26)), closes [#371](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/371)
- **#372:** Audit and update .env.example template ([fbf20ef](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/fbf20ef835b6327d0743dfa6b2e8edd0fe8c2b28)), closes [#372](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/372)

### Features
- **#366:** Add wallet address truncation with copy-to-clipboard ([3cf630f](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/3cf630f7ef0bd7387e4e8fe85920b72db50ca3c8)), closes [#366](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/366)

## [1.41.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.40.0...v1.41.0) (2026-05-29)

### Features
- add Winston structured logging with request tracing ([67ae50f](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/67ae50fa768a57deac38183d2cbdae4600b9d703)), closes [#4](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/4)

## [1.40.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.39.0...v1.40.0) (2026-05-29)

### Features
- add fade-in page transitions with reduced-motion support ([dd2235b](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/dd2235bf244afb5d26b864b806273ced0c1b8f6a)), closes [#362](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/362)
- Add pagination to GET /campaigns endpoint ([00ca227](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/00ca2276e9216d5fd1b820a34dae9905022aff0e))
- add rate limiting middleware (global 100/min, rewards 20/min) ([69fa401](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/69fa401ef99d0d56d4534c4df5e4b971e8756566))

## [1.39.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.38.0...v1.39.0) (2026-05-27)

### Features
- add empty state components for CampaignList, RewardList, and Analytics charts ([dd45805](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/dd45805b73b202b897f265d76c3d771061ea90ee)), closes [#393](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/393)
- configurable PostgreSQL connection pool with health check and exhaustion logging ([ee16654](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/ee1665411e11515ac47d413d701dd67d2af3f5fd))

## [1.38.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.37.0...v1.38.0) (2026-05-27)

### Features
- Add comprehensive Zod input validation middleware ([60c9a11](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/60c9a119e5127eba51200ef8004f702b1efddc65)), closes [#3](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/3)

## [1.37.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.36.0...v1.37.0) (2026-05-26)

### Features
- add coverage reporting and 70% threshold enforcement ([66cb446](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/66cb44686e46c206f1ba9f81bd63b63e90b35925))
- add XSS prevention - backend sanitization and frontend tests ([00d5e9b](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/00d5e9b2dd6250150b7f039b34a85df9ce148888)), closes [#401](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/401)

## [1.36.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.35.0...v1.36.0) (2026-05-26)

### Features
- add automated database backup script ([6083fef](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/6083fef92f30760570f3af91875ba5839c87f096)), closes [#400](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/400)

## [1.35.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.34.0...v1.35.0) (2026-05-26)

### Features
- **docker:** add prod compose with restart policy, resource limits, and JSON logging ([3c8b85b](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/3c8b85be3b0b787503d999012832157fbc09a041)), closes [#404](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/404) [#398](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/398) [#396](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/396)

## [1.34.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.33.0...v1.34.0) (2026-05-26)

### Features
- **security:** add secrets management tooling and documentation ([b1a1bfa](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/b1a1bfa691167656a6049add8afef8bb5c07a4e1)), closes [#406](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/406)

## [1.33.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.32.0...v1.33.0) (2026-04-29)

### Features
- implement RBAC with Admin/Minter/Pauser/Recorder roles across all contracts ([131abb1](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/131abb1347866e75cf805d80c3f0a1ee6145ea62)), closes [#123](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/123)

## [1.32.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.31.0...v1.32.0) (2026-04-29)

### Features
- optimize cross-contract call pattern in rewards contract ([ffb3810](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/ffb3810e3255af813718a9a731397a4160f38599)), closes [#116](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/116)

## [1.31.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.30.0...v1.31.0) (2026-04-29)

### Features
- **frontend:** add reusable ConfirmDialog for irreversible actions ([fd4ddd8](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/fd4ddd8d79af49983871ddbf9a4e17f2fa708550))
- **governance:** add on-chain governance contract for LYT holders ([075a06f](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/075a06f3306cf419eba223664a2879fcd22b3d92)), closes [#129](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/129)
- **rewards:** add referral mechanism with bonus LYT ([701bbbe](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/701bbbed966495a7adbd62c9cf718c8880f36ede)), closes [#30](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/30)

## [1.30.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.29.0...v1.30.0) (2026-04-29)

### Features
- **campaign:** add max_claims cap to campaigns ([8b4a0b8](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/8b4a0b85b05e7a20b352d0f80f520458734ec4dc)), closes [#111](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/111)

## [1.29.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.28.0...v1.29.0) (2026-04-29)

### Features
- add Sentry error monitoring for frontend and backend ([ef5d43b](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/ef5d43bc382645ccf91dc5a1c511b4275c87db95)), closes [#71](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/71)

## [1.28.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.27.1...v1.28.0) (2026-04-29)

### Features
- campaign deactivation UI for merchants ([#42](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/42)) ([df5d064](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/df5d0649cb1728f46d6bac619dd5c112a9624ff4))

## [1.27.1](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.27.0...v1.27.1) (2026-04-29)

### Bug Fixes
- WCAG 2.1 AA contrast audit and fixes ([f9b08bd](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/f9b08bd8de03379632b8d5549c650fc69a05ed9f))

## [1.27.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.26.0...v1.27.0) (2026-04-29)

### Features
- code of conduct ([cde1693](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/cde169306cfa77312bd66eb5d7747578c64d0ea8))

## [1.26.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.25.0...v1.26.0) (2026-04-29)

### Features
- audit log table for sensitive operations ([#22](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/22)) ([a46eb16](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/a46eb160f40f35ae418a290535d832eda1162fde))

## [1.25.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.24.0...v1.25.0) (2026-04-29)

### Features
- **contracts:** add campaign pause and resume functionality ([62027e7](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/62027e70cebf4560327e160f5398c9761f8cd9cb))

## [1.24.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.23.0...v1.24.0) (2026-04-29)

### Features
- add emergency pause mechanism across all three contracts ([d66d81b](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/d66d81ba0e3338228ed19f23c0c2c31964d2528d))
- automated PostgreSQL backup to S3 with 30-day retention ([ea0bc10](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/ea0bc100c998db10853c2a5cc57c4eadb554379e))

## [1.23.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.22.1...v1.23.0) (2026-04-29)

### Features
- centralized log aggregation with ELK stack ([#74](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/74)) ([c0b9e6d](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/c0b9e6d3b857a91cddd82d1351e8d7bf589af40a))
- JWT authentication for merchant endpoints ([#9](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/9)) ([327ffe7](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/327ffe771235220afe87007436bb9856b28a9646))

## [1.22.1](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.22.0...v1.22.1) (2026-04-29)

### Performance Improvements
- optimize campaign storage layout and implement temporary storage [#110](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/110) ([1d2b4c7](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/1d2b4c740c69e097f0afdfa996b78890af69941c))

## [1.22.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.21.1...v1.22.0) (2026-04-28)

### Features
- add onboarding flow ([#46](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/46)) and tooltip system ([#57](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/57)) ([28bb3aa](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/28bb3aaf5c2fa4f06da7c7502006bc5d93137fdb))

## [1.21.1](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.21.0...v1.21.1) (2026-04-28)

### Bug Fixes
- add database indexes for frequently queried columns ([5a96ade](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/5a96ade3b8adfcc32e93793acf26aa78471f5327))

## [1.21.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.20.0...v1.21.0) (2026-04-28)

### Features
- add search and filtering to GET /campaigns ([788e523](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/788e5239ae17036dcea192bb0c15a4243c8a2ddd))

## [1.20.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.19.0...v1.20.0) (2026-04-28)

### Features
- **rewards:** implement storage migration pattern with idempotency guard ([69b429e](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/69b429e3bfc17f770625e806f1ec8556af3779dd)), closes [#119](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/119)
- **token:** implement multi-sig admin for mint and set_admin ([c09f586](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/c09f586f7178107bfa046b2da183372766005566)), closes [#114](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/114)

## [1.19.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.18.0...v1.19.0) (2026-04-28)

### Features
- **rewards:** implement linear vesting schedule per campaign ([047d419](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/047d419d7e3942b6025aab8146c6ec1575790ee4)), closes [#128](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/128)

## [1.18.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.17.0...v1.18.0) (2026-04-28)

### Features
- harden Dockerfiles and add Trivy image scanning to CI ([2a51d90](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/2a51d903aeb26e49732b708bdda8cfcf4521f9a3))

## [1.17.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.16.0...v1.17.0) (2026-04-28)

### Features
- all issue ([a5a1c49](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/a5a1c494bad55dd717f570a8d5b5f47add9814d2))

## [1.16.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.15.1...v1.16.0) (2026-04-27)

### Features
- **analytics:** implement A/B testing framework ([#62](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/62)) ([84b5dcd](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/84b5dcd388dc48b1001a44de1be8eeaa87c8ba60))

## [1.15.1](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.15.0...v1.15.1) (2026-04-27)

### Performance Improvements
- optimize token transfer gas costs and add benchmarks ([21347d7](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/21347d750b92ce287579f39e4c6bcbb6e9672d7b))

## [1.15.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.14.0...v1.15.0) (2026-04-27)

### Features
- **ui:** design and implement landing page ([#55](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/55)) ([da5dffd](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/da5dffd0017f06287221752648c1a41fe4c03064))

## [1.14.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.13.0...v1.14.0) (2026-04-27)

### Features
- add skeleton loading states to analytics page ([142e9dc](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/142e9dcdea34b385ab5b6e77d472b7c4683fc158))

## [1.13.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.12.0...v1.13.0) (2026-04-27)

### Features
- **ui:** add multi-step transaction progress indicator ([#54](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/54)) ([bb94699](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/bb946995c002e6f002306edaef112efbcad7bec9))

## [1.12.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.11.0...v1.12.0) (2026-04-27)

### Features
- **ui:** responsive navigation with mobile hamburger menu ([109ef41](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/109ef41db92f1ace79fdb3beaf6f233ac9809318)), closes [#49](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/49)

## [1.11.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.10.0...v1.11.0) (2026-04-27)

### Features
- add time-weighted reward multiplier to rewards contract ([e4201aa](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/e4201aaf88d9e9ef3ab805526f4611832b1cad32))

## [1.10.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.9.0...v1.10.0) (2026-04-27)

### Features
- **ui:** global search with command palette (Cmd/Ctrl+K) ([74b5cdb](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/74b5cdb3343dee988b40e3857c06f3671a480855)), closes [#53](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/53)

## [1.9.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.8.0...v1.9.0) (2026-04-27)

### Features
- **infra:** add Terraform IaC modules for cloud resources ([e482ec1](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/e482ec11f425d1168a95d0dc048df49b7f6c2c40)), closes [#75](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/75)

## [1.8.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.7.0...v1.8.0) (2026-04-27)

### Bug Fixes
- **ui:** define z-index scale and fix stacking issues ([#63](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/63)) ([319bafd](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/319bafd95710b1222114d26e8b53e0f4354c0242))

### Features
- implement contract upgrade mechanism with timelock and multi-sig ([6593926](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/65939269383b2e38cc7687d479e89b441b25f32a))

## [1.7.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.6.0...v1.7.0) (2026-04-27)

### Features
- add event emission to all state-changing contract functions ([#115](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/115)) ([a62a38a](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/a62a38af74ebefacef7979c3a77888fda324bb0a))

## [1.6.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.5.0...v1.6.0) (2026-04-27)

### Features
- implement error boundary for Soroban transaction failures ([bac56e8](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/bac56e8118090c5edf5e90bd79bca4630e1c7cf3)), closes [#25](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/25)

## [1.5.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.4.0...v1.5.0) (2026-04-27)

### Features
- implement centralized error handling middleware ([a937d6f](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/a937d6fa32af3e99357b52c414159d6030faa403)), closes [#15](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/15)

## [1.4.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.3.0...v1.4.0) (2026-04-27)

### Features
- Implement campaign sharing via unique URL and QR code ([4b9eff0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/4b9eff00c85f2acff61c26cd529c22c7d88487e8))

## [1.3.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.2.0...v1.3.0) (2026-04-27)

### Features
- **token:** add ERC-20-style allowance mechanism ([5590228](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/5590228120af2bc2e7ecb2587681341d9935fb2b)), closes [#118](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/118)

## [1.2.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.1.0...v1.2.0) (2026-04-27)

### Features
- **campaign:** add on-chain name/description metadata ([8361fe3](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/8361fe3da0b0b63c5f48e23e4e0b14bcdfecaa26)), closes [#121](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/121)

## [1.1.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.0.0...v1.1.0) (2026-04-26)

### Features
- all issue resolved ([2368df9](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/2368df90ed71cdca137930226f70a03670bf377e))
- all issue resolved ([4987aeb](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/4987aeb74c407cf9c196dd6297b63b84189c8ef6))

## [1.0.0](https://github.com/Dev-Odun-oss/Soroban-Loyalty/compare/v1.0.0...v1.0.0) (2026-04-26)

### Bug Fixes
- resolve hydration mismatch in wallet context ([#39](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/39)) ([62e265b](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/62e265b7059ded160bcb4ecfd0fa9e66996be4ac))

### Features
- **#31:** implement dark mode with CSS variables, OS preference, and localStorage toggle ([4111057](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/4111057f0db5d2f9437d3caf232ee74a5f1918ce)), closes [#31](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/31)
- **#32:** detect Freighter not installed and show install prompt modal ([d783426](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/d78342619eca16a9b6aa061e8bf2750a136a7b02)), closes [#32](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/32)
- **#33:** implement optimistic UI updates for reward claims with rollback on failure ([4cdde99](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/4cdde993f9c05a4048b13763dd101b529440a207)), closes [#33](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/33)
- **#34:** add analytics dashboard with bar/line charts, stat cards, date range filter, and accessible data table fallbacks ([7780ec3](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/7780ec3f0ffa4e1fa431d9bf62461fc384030afb)), closes [#34](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/34)
- add /help page with searchable FAQ accordion ([#61](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/61)) ([18b6a26](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/18b6a26411a353bdd4d4569200f8411a7d6f3bff))
- add container resource limits to docker-compose ([#80](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/80)) ([f993c63](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/f993c63a58992db8b9b3ef049070f31db21edb3a))
- add keyboard navigation and WCAG 2.1 AA focus styles ([#41](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/41)) ([422388e](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/422388e73bb26df65ba15c9859c4f936db2912ca))
- add Kubernetes deployment manifests ([#71](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/71)) ([ca53bc9](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/ca53bc95f2c3098cf0833d3de4ba1975c372d884))
- add Playwright E2E tests and CI workflow ([#81](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/81)) ([6f2757d](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/6f2757dc2151b4b29889ac88ca4854ce0bb68864))
- add Prometheus/Grafana monitoring stack ([#73](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/73)) ([85cce87](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/85cce87bcff18b1da9eaa1ba09657d39beb54829))
- add toast notification system ([#36](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/36)) ([253974e](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/253974e88738a5fe2f74a24cb019a0a5b2788c63))
- automated SSL certificate renewal with Let's Encrypt ([#84](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/84)) ([140a9ca](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/140a9cac1a54c75993346d91d95a93998055a026))
- **backend:** add OpenAPI/Swagger documentation and fix stability issues ([a35cb4a](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/a35cb4aaf0f466f0ab4166a8a2b3693d05e9c9ba))
- campaign creation form on /merchant page (closes [#26](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/26)) ([3d8a814](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/3d8a8143500483cc9220a9a6d3814865fee0d6ab))
- campaign data table with sort, search, pagination, deactivate ([5c3d3c8](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/5c3d3c8f3a4bfea58e39f47c0c402ef865b7247d)), closes [#51](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/51)
- campaign expiry countdown timer ([fa648d1](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/fa648d1d3326a2e4a3b00c7f4f7265ec9cb06322))
- claim micro-animation with confetti and animated LYT counter ([ecfbc9e](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/ecfbc9e530c0f7bb21ef668f4ca25255c6619061)), closes [#52](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/52)
- configure Jest + RTL and add frontend unit tests ([eba1661](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/eba166117dcd9dfe4ea301cb554cfe55fbfe6419)), closes [#43](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/43)
- correlation ID middleware (closes [#12](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/12)) ([90f2707](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/90f2707cc87b45e52bc3b9eca4c86a44fabb4bea))
- Create changelog / Write incident response playbook / Document database schema / Write runbook for common ([a0d7eeb](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/a0d7eebea1fa969305da8bd043216674acfe7c69))
- design system with Tailwind tokens and component showcase ([#45](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/45)) ([ccfcce2](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/ccfcce29163a8715dc36cc38df8a2ada2025487f))
- **devops:** add infrastructure cost monitoring and budget alerts ([#87](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/87)) ([24ed808](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/24ed8082128de687d2dcb0deed1378e17d50a4af))
- **devops:** add uptime monitoring with status page ([#86](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/86)) ([eb533d5](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/eb533d5ab823f62252d4618ec29e948434159d92))
- drag-and-drop campaign reordering for merchants ([#65](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/65)) ([2f6ec8a](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/2f6ec8ac7a0214ec1652331b76ba1d745e962044))
- **env:** validate all env vars at startup with Zod ([7a25ddd](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/7a25dddc790c393317226dbe6aaeb0a2f996fd96))
- implement blue-green deployment strategy ([#76](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/76)) ([60f8bdb](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/60f8bdb9622687ee166b5968946d7bcf3dc6e462))
- implement infinite scroll for campaign listing ([#35](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/35)) ([0d98b89](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/0d98b89dde054e152154ce465e9ef394ce90dfb8))
- implement log-based alerting for critical errors ([#82](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/82)) ([8c38503](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/8c38503b755ea97ea2fa8978c4592af468843ebe))
- implement secrets management with AWS Secrets Manager ([#79](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/79)) ([ce9ef87](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/ce9ef8786c63dc20c93ff279afe751417bfa7bc7))
- implement user profile page ([#56](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/56)) ([3cca91b](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/3cca91bfc343e97a87053d14e8ba201e0f8ce1fd))
- improve empty state designs across all list views ([#47](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/47)) ([c5aba42](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/c5aba422e2f05c67ed222874e069ac194f20a0cc))
- **indexer:** exponential backoff, per-event retry, dead-letter queue ([8610c09](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/8610c091149820afc0847970d8ad4254ef79c65e))
- initial production implementation of SorobanLoyalty platform ([253d13e](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/253d13ee1a68259cbdf13eaa8d0c847edf46b0be))
- redeem flow UI with balance display and confirmation step ([112da2a](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/112da2a040e64fb454d3bfbd31431ee86097f957)), closes [#38](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/38)
- **security:** zero-downtime DB credential rotation via Secrets Manager ([#85](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/85)) ([79d9882](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/79d988260a1271d7f5f778b6bc15e0356be6c770))
- soft delete campaigns (closes [#17](https://github.com/Dev-Odun-oss/Soroban-Loyalty/issues/17)) ([626879d](https://github.com/Dev-Odun-oss/Soroban-Loyalty/commit/626879ddf63f565f638aedfd830d5c1e39015794))
