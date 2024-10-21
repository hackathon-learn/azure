terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
  cloud { 
    organization = "hackathon-learn" 
    workspaces { 
      name = "hackathon-learn-azure" 
    } 
  } 
  
}




provider "azurerm" {
  features {}

  subscription_id   = "a43dc29c-198c-4dd1-80b2-eec3342b1d35"
  tenant_id         = "542b1027-72dc-4685-8674-175655720883"
  client_id         = "8f34d4c4-3879-42f8-864b-94832b5ebe86"
  client_secret     = "keU8Q~MGRbMIiSkMl_qJ2ZUnU.89Q3J3y2zCKajQ"
}

resource "azurerm_resource_group" "platform1_rg" {
  name     = "platform1rg1"
  location = "North Europe"
}

resource "azurerm_container_registry" "platform1_cr" {
  name                = "platform1cr1"
  resource_group_name = azurerm_resource_group.platform1_rg.name
  location            = azurerm_resource_group.platform1_rg.location
  sku                 = "Premium"
}

resource "azurerm_kubernetes_cluster" "platform1_aks" {
  name                = "platform1aks1"
  location            = azurerm_resource_group.platform1_rg.location
  resource_group_name = azurerm_resource_group.platform1_rg.name
  dns_prefix          = "exampleaks1"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_D2_v2"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = "Production"
  }
}

resource "azurerm_role_assignment" "pltform1_ra" {
  principal_id                     = azurerm_kubernetes_cluster.platform1_aks.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.platform1_cr.id
  skip_service_principal_aad_check = true
}
