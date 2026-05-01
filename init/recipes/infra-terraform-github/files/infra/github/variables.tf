variable "repo_owner" {
  description = "GitHub user or org that owns the repo"
  type        = string
}

variable "repo_name" {
  description = "GitHub repository name"
  type        = string
  default     = "{{PROJECT_NAME}}"
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token to upload as a repo Actions secret. Empty to skip."
  type        = string
  sensitive   = true
  default     = ""
}

variable "cloudflare_account_id" {
  description = "Cloudflare account id to upload as a repo Actions secret. Empty to skip."
  type        = string
  default     = ""
}
