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

        let commentOriginal = tl.getInput('Comment', true);
        tl.debug("commentOriginal:" + commentOriginal);
        let comment = VariableResolver.resolveVariables(commentOriginal);
        tl.debug("comment:" + comment);
        // let auth = tl.getEndpointAuthorization('SystemVssConnection', false);
        // let credHandler = wa.getBearerHandler(auth.parameters['AccessToken']);
        let pat:string = tl.getVariable("AzureDevOps.Pat");
        // let accessToken:string = tl.getVariable("System.AccessToken");
        
        // let credHandler = wa.getBearerHandler(accessToken);
         let credHandler = wa.getPersonalAccessTokenHandler(pat);
        // let credHandler = wa.getBasicHandler("", accessToken);
        let connection = new wa.WebApi(tl.getVariable('System.TeamFoundationCollectionUri'), credHandler);
        let client = await connection.getGitApi();
        let commentObject = <GitInterfaces.Comment> {
            content : comment            
        };
        let thread : GitInterfaces.GitPullRequestCommentThread = <GitInterfaces.GitPullRequestCommentThread> {
            comments: [
                commentObject
            ]
        }
        if (process.env.SYSTEM_PULLREQUEST_PULLREQUESTID === undefined) {
            // If the build is not pull request, do nothing. 
            return; 
        }
        let repositoryId:string = process.env.BUILD_REPOSITORY_ID ? process.env.BUILD_REPOSITORY_ID : "";
        let pullRequestId:number = process.env.SYSTEM_PULLREQUEST_PULLREQUESTID ? parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTID) : 0;
        // TODO: We need to supress the comment if it is already created. 
        
        let currentThreads = await client.getThreads(repositoryId, pullRequestId);
        for (var currentThread of currentThreads) {
            if (currentThread.comments !== null && currentThread.comments !== undefined) {
                for (var threadComment of currentThread.comments) {
                    if (threadComment.content === comment) {
                        return; // If the same comment is already there. 
                    }
                }
            }
        }

        if(pullRequestId != 0) {
            let createdThread = await client.createThread(thread, repositoryId, pullRequestId);
        } 
      } catch (e) {
            throw new Error(tl.loc('FailToCreateComment', e));
      } 

    }
}

new CreatePRCommentTask().run();