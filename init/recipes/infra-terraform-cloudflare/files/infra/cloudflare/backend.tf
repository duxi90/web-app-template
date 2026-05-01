# Remote state on Cloudflare R2 (S3-compatible).
# Uncomment after creating a private bucket named `{{PROJECT_NAME}}-tfstate`
# (you can do this once via the Cloudflare dashboard or a separate bootstrap
# Terraform run with local state).
#
# terraform {
#   backend "s3" {
#     bucket                      = "{{PROJECT_NAME}}-tfstate"
#     key                         = "cloudflare/terraform.tfstate"
#     region                      = "auto"
#     skip_credentials_validation = true
#     skip_metadata_api_check     = true
#     skip_region_validation      = true
#     skip_requesting_account_id  = true
#     skip_s3_checksum            = true
#     use_path_style              = true
#     endpoints = {
#       s3 = "https://{{CF_ACCOUNT_ID_PLACEHOLDER}}.r2.cloudflarestorage.com"
#     }
#   }
# }
