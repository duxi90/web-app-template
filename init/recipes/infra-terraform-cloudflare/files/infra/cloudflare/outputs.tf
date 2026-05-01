output "r2_assets_bucket" {
  description = "Name of the R2 assets bucket"
  value       = cloudflare_r2_bucket.assets.name
}

output "r2_assets_domain" {
  description = "Public custom domain for the assets bucket (empty if not configured)"
  value       = var.assets_domain
}
