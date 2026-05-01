terraform {
  required_version = ">= 1.10.0"
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  owner = var.repo_owner
  # token is read from $GITHUB_TOKEN
}

resource "github_branch_protection" "main" {
  repository_id = var.repo_name
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = ["Test & lint", "Lint workflows"]
  }

  required_pull_request_reviews {
    dismiss_stale_reviews           = true
    required_approving_review_count = 1
  }

  enforce_admins      = false
  require_signed_commits = false
}

resource "github_actions_secret" "cloudflare_api_token" {
  count           = var.cloudflare_api_token == "" ? 0 : 1
  repository      = var.repo_name
  secret_name     = "CLOUDFLARE_API_TOKEN"
  plaintext_value = var.cloudflare_api_token
}

resource "github_actions_secret" "cloudflare_account_id" {
  count           = var.cloudflare_account_id == "" ? 0 : 1
  repository      = var.repo_name
  secret_name     = "CLOUDFLARE_ACCOUNT_ID"
  plaintext_value = var.cloudflare_account_id
}
