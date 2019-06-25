import * as tl from 'azure-pipelines-task-lib';
import { join } from 'path';
import * as azdev from "azure-devops-node-api";
import * as wa from "azure-devops-node-api/WebApi";
import * as GitApi from "azure-devops-node-api/GitApi";
import * as GitInterfaces from "azure-devops-node-api/interfaces/GitInterfaces";
import VariableResolver from './VariableResolver';

class CreatePRCommentTask {

    public async run(): Promise<void> {
      try {

        let comment = VariableResolver.resolveVariables(tl.getInput('Comment', true));

        let auth = tl.getEndpointAuthorization('SystemVssConnection', false);
        let credHandler = wa.getBearerHandler(auth.parameters['AccessToken']);
        let connection = new wa.WebApi(tl.getVariable('System.TeamFoundationCollectionUri'), credHandler);
        let client = await connection.getGitApi();

        let thread : GitInterfaces.GitPullRequestCommentThread = <GitInterfaces.GitPullRequestCommentThread> {
            comments: [
                comment
            ]
        }
        if (process.env.SYSTEM_PULLREQUEST_PULLREQUESTID === undefined) {
            // If the build is not pull request, do nothing. 
            return; 
        }
        let repositoryId:string = process.env.BUILD_REPOSITORY_ID ? process.env.BUILD_REPOSITORY_ID : "";
        let pullRequestId:number = process.env.SYSTEM_PULLREQUEST_PULLREQUESTID ? parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTID) : 0;
        // TODO: We need to supress the comment if it is already created. 
        let createdThread = await client.createThread(thread, repositoryId, pullRequestId);
      } catch (e) {

      } 

    }
}

new CreatePRCommentTask().run();