variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token (R2:Edit + DNS:Edit + Workers:Edit)"
  type        = string
  sensitive   = true
}

variable "zone_id" {
  description = "Cloudflare zone id for the project domain (optional; required if managing DNS or attaching a custom domain to R2)"
  type        = string
  default     = ""
}

variable "r2_location" {
  description = "R2 bucket location hint (e.g. WEUR, EEUR, ENAM, WNAM, APAC)"
  type        = string
  default     = "WEUR"
}

variable "assets_domain" {
  description = "Custom domain for the public assets R2 bucket (e.g. assets.{{PROJECT_NAME}}.example). Empty to skip."
  type        = string
  default     = ""
}

variable "app_domain" {
  description = "Apex domain the web app is served on (e.g. {{PROJECT_NAME}}.example). Used by commented-out Worker routes."
  type        = string
  default     = ""
}
