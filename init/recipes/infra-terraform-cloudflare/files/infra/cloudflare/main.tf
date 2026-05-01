terraform {
  required_version = ">= 1.10.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# R2 bucket for assets (images, build artifacts, user uploads).
resource "cloudflare_r2_bucket" "assets" {
  account_id = var.cloudflare_account_id
  name       = "{{PROJECT_NAME}}-assets"
  location   = var.r2_location
}

# Public custom domain for the assets bucket. Comment out if you don't want
# the bucket exposed publicly.
resource "cloudflare_r2_custom_domain" "assets" {
  count       = var.assets_domain == "" ? 0 : 1
  account_id  = var.cloudflare_account_id
  bucket_name = cloudflare_r2_bucket.assets.name
  domain      = var.assets_domain
  zone_id     = var.zone_id
  enabled     = true
}

# Example: a Worker route. Wrangler creates the script; Terraform owns the route.
# resource "cloudflare_workers_route" "ssr" {
#   zone_id     = var.zone_id
#   pattern     = "${var.app_domain}/*"
#   script_name = "{{PROJECT_NAME}}-web-ssr"
# }
