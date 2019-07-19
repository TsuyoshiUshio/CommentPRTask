# Create PR Comment Task

Create a pull request comment if a CI is trigged by Pull Request. 

# How to use 

## Configuration

Put your Azure DevOps personal access token on the Variables with the name of `AzureDevOps.Pat`

## Generate comment 

Put the comment body on the task. It enable to replace the variables if it specified. 

### example

```
Fossa reports a <a href="https://dev.azure.com/csedevops/DevSecOps/_workitems/edit/$(CWI.Id)">Bug</a> created. Please review it. 
```

# TODO 

* The Personal Access Token configuration will move to the service configration in the near future. 
* Need to refactor and add tests for production ready


