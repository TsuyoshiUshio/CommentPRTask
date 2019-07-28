# Create PR Comment Task

![Comment](https://raw.githubusercontent.com/TsuyoshiUshio/CommentPRTask/master/doc/images/Comment.png)

Create a pull request comment if a CI is trigged by Pull Request. 

# How to use 

## Configuration

Install this extension to your project. Find the CreatePRCommentTask. 

![CreatePRCommentTask](https://raw.githubusercontent.com/TsuyoshiUshio/CommentPRTask/master/doc/images/CreatePRCommentTask.png)

## Details

![Task details](https://raw.githubusercontent.com/TsuyoshiUshio/CommentPRTask/master/doc/images/CommentTask.png)

| Name | Description |
|--------|---------------------|
| Azure DevOps PAT | Select Azure DevOps Personal Access Token. or you can create new one|
| Comment | If the pipeline is executed by Pull Request Validation, this task create a Pull Request Comment.|

On the Comment, you can use Variables. The variables will be substituted by the actual value. e.g. `$(CWI.Id)`.
The comment becomes message body of your Pull Request Comment. 

## Personal Access Token Service Connection

Put your Azure DevOps personal access token in `PAT`. The PAT requires permission to write Code. For more detail, [Pull Request Thread Comments - Create](https://docs.microsoft.com/en-us/rest/api/azure/devops/git/pull%20request%20thread%20comments/create?view=azure-devops-server-rest-5.0). `Connection name` is just a label of this service connection. `Server URL` is not used currently, however it might be good as memo which you use it for. 

![ServiceConnection](https://raw.githubusercontent.com/TsuyoshiUshio/CommentPRTask/master/doc/images/ServiceConnection.png)

### example

Sample of the Comment.

```
CredScan reports a <a href="https://dev.azure.com/csedevops/DevSecOps/_workitems/edit/$(CWI.Id)">Bug</a> created. Please review it. 
```

# Contribution

For more details [here](https://github.com/TsuyoshiUshio/CommentPRTask/blob/master/Contribution.md).

