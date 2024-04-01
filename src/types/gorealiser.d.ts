/**
 * goreleaser configuration definition file
 */
interface GoReleaserConfiguration {
  announce?: Announce;
  archives?: ArchiveElement[];
  artifactories?: ArtifactoryElement[];
  aurs?: AurElement[];
  before?: Before;
  blobs?: BlobElement[];
  brews?: BrewElement[];
  /**
   * use builds instead
   */
  build?: Build;
  builds?: Build[];
  changelog?: Changelog;
  checksum?: Checksum;
  chocolateys?: ChocolateyElement[];
  dist?: string;
  docker_manifests?: DockerManifestElement[];
  docker_signs?: DockerSignElement[];
  dockers?: DockerElement[];
  env?: string[];
  env_files?: EnvFiles;
  force_token?: ForceToken;
  git?: CoordinateGit;
  gitea_urls?: GiteaUrls;
  github_urls?: GithubUrls;
  gitlab_urls?: GitlabUrls;
  gomod?: Gomod;
  kos?: KoElement[];
  krews?: KrewElement[];
  metadata?: Metadata;
  milestones?: MilestoneElement[];
  nfpms?: NfpmElement[];
  nix?: NixElement[];
  project_name?: string;
  publishers?: PublisherElement[];
  release?: Release;
  report_sizes?: boolean;
  sboms?: SbomElement[];
  /**
   * use scoops instead
   */
  scoop?: Scoop;
  scoops?: Scoop[];
  signs?: DockerSignElement[];
  snapcrafts?: SnapcraftElement[];
  snapshot?: Snapshot;
  source?: Source;
  universal_binaries?: UniversalBinaryElement[];
  uploads?: ArtifactoryElement[];
  upx?: UpxElement[];
  version?: number;
  winget?: WingetElement[];
}

interface Announce {
  discord?: Discord;
  linkedin?: Linkedin;
  mastodon?: Mastodon;
  mattermost?: Mattermost;
  opencolletive?: Opencolletive;
  reddit?: Reddit;
  skip?: Skip;
  slack?: Slack;
  smtp?: SMTP;
  teams?: Teams;
  telegram?: Telegram;
  twitter?: Twitter;
  webhook?: Webhook;
}

interface Discord {
  author?: string;
  color?: string;
  enabled?: boolean;
  icon_url?: string;
  message_template?: string;
}

interface Linkedin {
  enabled?: boolean;
  message_template?: string;
}

interface Mastodon {
  enabled?: boolean;
  message_template?: string;
  server: string;
}

interface Mattermost {
  channel?: string;
  color?: string;
  enabled?: boolean;
  icon_emoji?: string;
  icon_url?: string;
  message_template?: string;
  title_template?: string;
  username?: string;
}

interface Opencolletive {
  enabled?: boolean;
  message_template?: string;
  slug?: string;
  title_template?: string;
}

interface Reddit {
  application_id?: string;
  enabled?: boolean;
  sub?: string;
  title_template?: string;
  url_template?: string;
  username?: string;
}

type Skip = boolean | string;

interface Slack {
  attachments?: AttachmentElement[];
  blocks?: BlockElement[];
  channel?: string;
  enabled?: boolean;
  icon_emoji?: string;
  icon_url?: string;
  message_template?: string;
  username?: string;
}

interface AttachmentElement {
  Internal: unknown;
}

interface BlockElement {
  Internal: unknown;
}

interface SMTP {
  body_template?: string;
  enabled?: boolean;
  from?: string;
  host?: string;
  insecure_skip_verify?: boolean;
  port?: number;
  subject_template?: string;
  to?: string[];
  username?: string;
}

interface Teams {
  color?: string;
  enabled?: boolean;
  icon_url?: string;
  message_template?: string;
  title_template?: string;
}

interface Telegram {
  chat_id?: ChatID;
  enabled?: boolean;
  message_template?: string;
  parse_mode?: ParseMode;
}

type ChatID = number | string;

type ParseMode = 'MarkdownV2' | 'HTML';

interface Twitter {
  enabled?: boolean;
  message_template?: string;
}

interface Webhook {
  content_type?: string;
  enabled?: boolean;
  endpoint_url?: string;
  headers?: { [key: string]: string };
  message_template?: string;
  skip_tls_verify?: boolean;
}

interface ArchiveElement {
  allow_different_binary_count?: boolean;
  builds?: string[];
  builds_info?: BuildsInfo;
  files?: FileElement[];
  format?: ArchiveFormat;
  format_overrides?: FormatOverrideElement[];
  id?: string;
  meta?: boolean;
  name_template?: string;
  /**
   * you can now remove this
   */
  rlcp?: Skip;
  strip_parent_binary_folder?: boolean;
  wrap_in_directory?: Skip;
}

interface BuildsInfo {
  group?: string;
  mode?: number;
  mtime?: string;
  owner?: string;
}

type FileElement = FileClass | string;

interface FileClass {
  dst?: string;
  info?: Info;
  src?: string;
  strip_parent?: boolean;
}

interface Info {
  group?: string;
  mode?: number;
  mtime?: string;
  owner?: string;
}

type ArchiveFormat = 'tar' | 'tgz' | 'tar.gz' | 'zip' | 'gz' | 'tar.xz' | 'txz' | 'binary';

interface FormatOverrideElement {
  format?: ArchiveFormat;
  goos?: GOOS;
}

interface ArtifactoryElement {
  checksum?: boolean;
  checksum_header?: string;
  client_x509_cert?: string;
  client_x509_key?: string;
  custom_artifact_name?: boolean;
  custom_headers?: { [key: string]: string };
  exts?: string[];
  ids?: string[];
  method?: string;
  mode?: string;
  name?: string;
  signature?: boolean;
  target?: string;
  trusted_certificates?: string;
  username?: string;
}

interface AurElement {
  backup?: string[];
  commit_author?: CommitAuthor;
  commit_msg_template?: string;
  conflicts?: string[];
  contributors?: string[];
  depends?: string[];
  description?: string;
  directory?: string;
  git_ssh_command?: string;
  git_url?: string;
  goamd64?: string;
  homepage?: string;
  ids?: string[];
  license?: string;
  maintainers?: string[];
  name?: string;
  optdepends?: string[];
  package?: string;
  private_key?: string;
  provides?: string[];
  rel?: string;
  skip_upload?: Skip;
  url_template?: string;
}

interface CommitAuthor {
  email?: string;
  name?: string;
}

interface Before {
  hooks?: string[];
}

interface BlobElement {
  acl?: string;
  bucket?: string;
  cache_control?: string[];
  content_disposition?: string;
  disable?: Skip;
  disable_ssl?: boolean;
  /**
   * use disable_ssl instead
   */
  disableSSL?: boolean;
  endpoint?: string;
  extra_files?: BlobExtraFile[];
  folder?: string;
  ids?: string[];
  kms_key?: string;
  /**
   * use kms_key instead
   */
  kmskey?: string;
  provider?: string;
  region?: string;
  s3_force_path_style?: boolean;
}

interface BlobExtraFile {
  glob?: string;
  name_template?: string;
}

interface BrewElement {
  caveats?: string;
  commit_author?: CommitAuthor;
  commit_msg_template?: string;
  conflicts?: string[];
  custom_block?: string;
  custom_require?: string;
  dependencies?: BrewDependency[];
  description?: string;
  download_strategy?: string;
  extra_install?: string;
  folder?: string;
  goamd64?: string;
  goarm?: ChatID;
  homepage?: string;
  ids?: string[];
  install?: string;
  license?: string;
  name?: string;
  /**
   * use service instead
   */
  plist?: string;
  post_install?: string;
  repository?: Repository;
  service?: string;
  skip_upload?: Skip;
  /**
   * use repository instead
   */
  tap?: Repository;
  test?: string;
  url_template?: string;
}

type BrewDependency = PurpleCoordinat | string;

interface PurpleCoordinat {
  name?: string;
  os?: PurpleOS;
  type?: string;
  version?: string;
}

type PurpleOS = 'mac' | 'linux';

/**
 * use repository instead
 */
interface Repository {
  branch?: string;
  git?: BucketGit;
  name?: string;
  owner?: string;
  pull_request?: PullRequest;
  token?: string;
}

interface BucketGit {
  private_key?: string;
  ssh_command?: string;
  url?: string;
}

interface PullRequest {
  base?: Base;
  draft?: boolean;
  enabled?: boolean;
}

type Base = BaseClass | string;

interface BaseClass {
  branch?: string;
  name?: string;
  owner?: string;
}

/**
 * use builds instead
 */
interface Build {
  asmflags?: Asmflags;
  binary?: string;
  builder?: string;
  buildmode?: Buildmode;
  command?: string;
  dir?: string;
  env?: string[];
  flags?: Asmflags;
  gcflags?: Asmflags;
  goamd64?: string[];
  goarch?: string[];
  goarm?: string[];
  gobinary?: string;
  gomips?: string[];
  goos?: string[];
  hooks?: Hooks;
  id?: string;
  ignore?: IgnoreElement[];
  ldflags?: Asmflags;
  main?: string;
  mod_timestamp?: string;
  no_main_check?: boolean;
  no_unique_dist_dir?: boolean;
  overrides?: OverrideElement[];
  skip?: boolean;
  tags?: Asmflags;
  targets?: string[];
}

type Asmflags = string[] | string;

type Buildmode = 'c-archive' | 'c-shared' | '';

interface Hooks {
  post?: Post;
  pre?: Post;
}

type Post = PostElement[] | string;

type PostElement = PostClass | string;

interface PostClass {
  cmd?: string;
  dir?: string;
  env?: string[];
  output?: boolean;
}

interface IgnoreElement {
  goamd64?: string;
  goarch?: string;
  goarm?: ChatID;
  gomips?: string;
  goos?: string;
}

interface OverrideElement {
  asmflags?: Asmflags;
  buildmode?: Buildmode;
  env?: string[];
  flags?: Asmflags;
  gcflags?: Asmflags;
  goamd64?: string;
  goarch?: string;
  goarm?: ChatID;
  gomips?: string;
  goos?: string;
  ldflags?: Asmflags;
  tags?: Asmflags;
}

interface Changelog {
  abbrev?: number;
  disable?: Skip;
  filters?: Filters;
  groups?: GroupElement[];
  /**
   * use disable instead
   */
  skip?: Skip;
  sort?: Sort;
  use?: ChangelogUse;
}

interface Filters {
  exclude?: string[];
  include?: string[];
}

interface GroupElement {
  order?: number;
  regexp?: string;
  title?: string;
}

type Sort = 'asc' | 'desc' | '';

type ChangelogUse = 'git' | 'github' | 'github-native' | 'gitlab';

interface Checksum {
  algorithm?: string;
  disable?: boolean;
  extra_files?: BlobExtraFile[];
  ids?: string[];
  name_template?: string;
}

interface ChocolateyElement {
  api_key?: string;
  authors?: string;
  bug_tracker_url?: string;
  copyright?: string;
  dependencies?: ChocolateyDependency[];
  description?: string;
  docs_url?: string;
  goamd64?: string;
  icon_url?: string;
  ids?: string[];
  license_url?: string;
  name?: string;
  owners?: string;
  package_source_url?: string;
  project_source_url?: string;
  project_url?: string;
  release_notes?: string;
  require_license_acceptance?: boolean;
  skip_publish?: boolean;
  source_repo?: string;
  summary?: string;
  tags?: string;
  title?: string;
  url_template?: string;
}

interface ChocolateyDependency {
  id?: string;
  version?: string;
}

interface DockerManifestElement {
  create_flags?: string[];
  id?: string;
  image_templates?: string[];
  name_template?: string;
  push_flags?: string[];
  skip_push?: Skip;
  use?: string;
}

interface DockerSignElement {
  args?: string[];
  artifacts?: DockerSignArtifacts;
  certificate?: string;
  cmd?: string;
  env?: string[];
  id?: string;
  ids?: string[];
  output?: boolean;
  signature?: string;
  stdin?: string;
  stdin_file?: string;
}

type DockerSignArtifacts =
  'all'
  | 'manifests'
  | 'images'
  | 'checksum'
  | 'source'
  | 'package'
  | 'archive'
  | 'binary'
  | 'sbom';

interface DockerElement {
  build_flag_templates?: string[];
  dockerfile?: string;
  extra_files?: string[];
  goamd64?: string;
  goarch?: string;
  goarm?: ChatID;
  goos?: string;
  id?: string;
  ids?: string[];
  image_templates?: string[];
  push_flags?: string[];
  skip_push?: Skip;
  use?: DockerUse;
}

type DockerUse = 'docker' | 'buildx';

interface EnvFiles {
  gitea_token?: string;
  github_token?: string;
  gitlab_token?: string;
}

type ForceToken = 'github' | 'gitlab' | 'gitea' | '';

interface CoordinateGit {
  ignore_tags?: string[];
  prerelease_suffix?: string;
  tag_sort?: TagSort;
}

type TagSort = '-version:refname' | '-version:creatordate';

interface GiteaUrls {
  api?: string;
  download?: string;
  skip_tls_verify?: boolean;
}

interface GithubUrls {
  api?: string;
  download?: string;
  skip_tls_verify?: boolean;
  upload?: string;
}

interface GitlabUrls {
  api?: string;
  download?: string;
  skip_tls_verify?: boolean;
  use_job_token?: boolean;
  use_package_registry?: boolean;
}

interface Gomod {
  env?: string[];
  gobinary?: string;
  mod?: string;
  proxy?: boolean;
}

interface KoElement {
  bare?: boolean;
  base_image?: string;
  base_import_paths?: boolean;
  build?: string;
  creation_time?: string;
  env?: string[];
  flags?: string[];
  id?: string;
  ko_data_creation_time?: string;
  labels?: { [key: string]: string };
  ldflags?: string[];
  main?: string;
  platforms?: string[];
  preserve_import_paths?: boolean;
  repository?: string;
  sbom?: string;
  tags?: string[];
  working_dir?: string;
}

interface KrewElement {
  caveats?: string;
  commit_author?: CommitAuthor;
  commit_msg_template?: string;
  description?: string;
  goamd64?: string;
  goarm?: ChatID;
  homepage?: string;
  ids?: string[];
  /**
   * use repository instead
   */
  index?: Repository;
  name?: string;
  repository?: Repository;
  short_description?: string;
  skip_upload?: Skip;
  url_template?: string;
}

interface Metadata {
  mod_timestamp?: string;
}

interface MilestoneElement {
  close?: boolean;
  fail_on_error?: boolean;
  name_template?: string;
  repo?: Repo;
}

interface Repo {
  name?: string;
  owner?: string;
}

interface NfpmElement {
  apk?: Apk;
  archlinux?: Archlinux;
  bindir?: string;
  builds?: string[];
  changelog?: string;
  conflicts?: string[];
  contents?: ContentElement[];
  deb?: Deb;
  dependencies?: string[];
  description?: string;
  epoch?: string;
  file_name_template?: string;
  formats?: string[];
  homepage?: string;
  id?: string;
  libdirs?: Libdirs;
  license?: string;
  maintainer?: string;
  meta?: boolean;
  overrides?: { [key: string]: OverrideValue };
  package_name?: string;
  prerelease?: string;
  priority?: string;
  provides?: string[];
  recommends?: string[];
  release?: string;
  replaces?: string[];
  rpm?: RPM;
  scripts?: OverrideScripts;
  section?: string;
  suggests?: string[];
  umask?: number;
  vendor?: string;
  version_metadata?: string;
}

interface Apk {
  scripts?: ApkScripts;
  signature?: ApkSignature;
}

interface ApkScripts {
  postupgrade?: string;
  preupgrade?: string;
}

interface ApkSignature {
  key_file?: string;
  key_name?: string;
}

interface Archlinux {
  packager?: string;
  pkgbase?: string;
  scripts?: ArchlinuxScripts;
}

interface ArchlinuxScripts {
  postupgrade?: string;
  preupgrade?: string;
}

interface ContentElement {
  dst: string;
  expand?: boolean;
  file_info?: FileInfo;
  packager?: string;
  src?: string;
  type?: Type;
}

interface FileInfo {
  group?: string;
  mode?: number;
  mtime?: Date;
  owner?: string;
}

type Type = 'symlink' | 'ghost' | 'config' | 'config|noreplace' | 'dir' | 'tree' | '';

interface Deb {
  breaks?: string[];
  lintian_overrides?: string[];
  scripts?: DebScripts;
  signature?: DebSignature;
  triggers?: Triggers;
}

interface DebScripts {
  rules?: string;
  templates?: string;
}

interface DebSignature {
  key_file?: string;
  type?: string;
}

interface Triggers {
  activate?: string[];
  activate_await?: string[];
  activate_noawait?: string[];
  interest?: string[];
  interest_await?: string[];
  interest_noawait?: string[];
}

interface Libdirs {
  carchive?: string;
  cshared?: string;
  header?: string;
}

interface OverrideValue {
  apk?: Apk;
  archlinux?: Archlinux;
  conflicts?: string[];
  contents?: ContentElement[];
  deb?: Deb;
  dependencies?: string[];
  epoch?: string;
  file_name_template?: string;
  package_name?: string;
  prerelease?: string;
  provides?: string[];
  recommends?: string[];
  release?: string;
  replaces?: string[];
  rpm?: RPM;
  scripts?: OverrideScripts;
  suggests?: string[];
  umask?: number;
  version_metadata?: string;
}

interface RPM {
  compression?: string;
  group?: string;
  packager?: string;
  prefixes?: string[];
  scripts?: RPMScripts;
  signature?: RPMSignature;
  summary?: string;
}

interface RPMScripts {
  posttrans?: string;
  pretrans?: string;
}

interface RPMSignature {
  key_file?: string;
}

interface OverrideScripts {
  postinstall?: string;
  postremove?: string;
  preinstall?: string;
  preremove?: string;
}

interface NixElement {
  commit_author?: CommitAuthor;
  commit_msg_template?: string;
  dependencies?: NixDependency[];
  description?: string;
  extra_install?: string;
  goamd64?: string;
  homepage?: string;
  ids?: string[];
  install?: string;
  license?: string;
  name?: string;
  path?: string;
  post_install?: string;
  repository?: Repository;
  skip_upload?: Skip;
  url_template?: string;
}

type NixDependency = FluffyCoordinat | string;

interface FluffyCoordinat {
  name: string;
  os?: FluffyOS;
}

type FluffyOS = 'linux' | 'darwin';

interface PublisherElement {
  checksum?: boolean;
  cmd?: string;
  dir?: string;
  disable?: Skip;
  env?: string[];
  extra_files?: BlobExtraFile[];
  ids?: string[];
  name?: string;
  signature?: boolean;
}

interface Release {
  disable?: Skip;
  discussion_category_name?: string;
  draft?: boolean;
  extra_files?: BlobExtraFile[];
  footer?: string;
  gitea?: Repo;
  github?: Repo;
  gitlab?: Repo;
  header?: string;
  ids?: string[];
  make_latest?: Skip;
  mode?: Mode;
  name_template?: string;
  prerelease?: string;
  replace_existing_draft?: boolean;
  skip_upload?: Skip;
  target_commitish?: string;
}

type Mode = 'keep-existing' | 'append' | 'prepend' | 'replace';

interface SbomElement {
  args?: string[];
  artifacts?: SbomArtifacts;
  cmd?: string;
  documents?: string[];
  env?: string[];
  id?: string;
  ids?: string[];
}

type SbomArtifacts = 'source' | 'package' | 'archive' | 'binary' | 'any';

/**
 * use scoops instead
 */
interface Scoop {
  /**
   * use repository instead
   */
  bucket?: Repository;
  commit_author?: CommitAuthor;
  commit_msg_template?: string;
  depends?: string[];
  description?: string;
  folder?: string;
  goamd64?: string;
  homepage?: string;
  ids?: string[];
  license?: string;
  name?: string;
  persist?: string[];
  post_install?: string[];
  pre_install?: string[];
  repository?: Repository;
  shortcuts?: Array<string[]>;
  skip_upload?: Skip;
  url_template?: string;
}

interface SnapcraftElement {
  apps?: { [key: string]: AppValue };
  assumes?: string[];
  base?: string;
  builds?: string[];
  channel_templates?: string[];
  confinement?: string;
  description?: string;
  disable?: Skip;
  extra_files?: SnapcraftExtraFile[];
  grade?: string;
  hooks?: { [key: string]: unknown };
  icon?: string;
  id?: string;
  layout?: { [key: string]: LayoutValue };
  license?: string;
  name?: string;
  name_template?: string;
  plugs?: { [key: string]: unknown };
  publish?: boolean;
  summary?: string;
  title?: string;
}

interface AppValue {
  adapter?: string;
  after?: string[];
  aliases?: string[];
  args?: string;
  autostart?: string;
  before?: string[];
  bus_name?: string;
  command: string;
  command_chain?: string[];
  common_id?: string;
  completer?: string;
  daemon?: string;
  desktop?: string;
  environment?: { [key: string]: unknown };
  extensions?: string[];
  install_mode?: string;
  passthrough?: { [key: string]: unknown };
  plugs?: string[];
  post_stop_command?: string;
  refresh_mode?: string;
  reload_command?: string;
  restart_condition?: string;
  restart_delay?: string;
  slots?: string[];
  sockets?: { [key: string]: unknown };
  start_timeout?: string;
  stop_command?: string;
  stop_mode?: string;
  stop_timeout?: string;
  timer?: string;
  watchdog_timeout?: string;
}

interface SnapcraftExtraFile {
  destination?: string;
  mode?: number;
  source: string;
}

interface LayoutValue {
  bind?: string;
  bind_file?: string;
  symlink?: string;
  type?: string;
}

interface Snapshot {
  name_template?: string;
}

interface Source {
  enabled?: boolean;
  files?: FileElement[];
  format?: SourceFormat;
  name_template?: string;
  prefix_template?: string;
  /**
   * you can now remove this
   */
  rlcp?: Skip;
}

type SourceFormat = 'tar' | 'tgz' | 'tar.gz' | 'zip';

interface UniversalBinaryElement {
  hooks?: Hooks;
  id?: string;
  ids?: string[];
  mod_timestamp?: string;
  name_template?: string;
  replace?: boolean;
}

interface UpxElement {
  binary?: string;
  brute?: boolean;
  compress?: Compress;
  enabled?: Skip;
  goamd64?: string[];
  goarch?: string[];
  goarm?: string[];
  goos?: string[];
  ids?: string[];
  lzma?: boolean;
}

type Compress = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'best' | '';

interface WingetElement {
  author?: string;
  commit_author?: CommitAuthor;
  commit_msg_template?: string;
  copyright?: string;
  copyright_url?: string;
  dependencies?: WingetDependency[];
  description?: string;
  goamd64?: string;
  homepage?: string;
  ids?: string[];
  license: string;
  license_url?: string;
  name: string;
  package_identifier?: string;
  path?: string;
  publisher: string;
  publisher_support_url?: string;
  publisher_url?: string;
  release_notes?: string;
  release_notes_url?: string;
  repository: Repository;
  short_description: string;
  skip_upload?: Skip;
  tags?: string[];
  url_template?: string;
}

interface WingetDependency {
  minimum_version?: string;
  package_identifier: string;
}
