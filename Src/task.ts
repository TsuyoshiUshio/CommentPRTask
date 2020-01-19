import * as tl from 'azure-pipelines-task-lib';
import * as wa from "azure-devops-node-api/WebApi";
import * as GitInterfaces from "azure-devops-node-api/interfaces/GitInterfaces";
import VariableResolver from './variableresolver';
import { IGitApi, GitApi } from 'azure-devops-node-api/GitApi';
import { IRequestHandler } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';

export interface IClientFactory {
    create(): Promise<IGitApi>;
}

class ClientFactory implements IClientFactory {
    public async create(): Promise<IGitApi> {

        let authType = tl.getInput("AuthType");
        let credHandler: IRequestHandler;

        switch (authType) {
            case "PAT": {
                let patService = tl.getInput('AzureDevOpsService');
                let pat:string = tl.getEndpointAuthorizationParameter(patService, 'pat', false);
                credHandler = wa.getPersonalAccessTokenHandler(pat);
                break;
            }        
            case "PIPELINE": {
                 let bearer = tl.getVariable('System.AccessToken');
                 credHandler = wa.getBearerHandler(bearer);
                 break;
            }
            default:
                throw "Unknow authentification type";
        }

        let connection = new wa.WebApi(tl.getVariable('System.TeamFoundationCollectionUri'), credHandler);
        return await connection.getGitApi();
    }
}

export class CreatePRCommentTask {
    factory: IClientFactory;

    constructor(clientFactory: IClientFactory) {
        this.factory = clientFactory;
    }
     
    public async run(): Promise<void> {
      try {
        let commentOriginal = tl.getInput('Comment', true);
        tl.debug("commentOriginal:" + commentOriginal);
        let comment = VariableResolver.resolveVariables(commentOriginal);
        tl.debug("comment:" + comment);

        let client = await this.factory.create();

        let commentObject = <GitInterfaces.Comment> {
            content : comment,
            commentType: GitInterfaces.CommentType.System    
        };
        let thread : GitInterfaces.GitPullRequestCommentThread = <GitInterfaces.GitPullRequestCommentThread> {
            comments: [
                commentObject
            ],
            status: GitInterfaces.CommentThreadStatus.ByDesign
        }
        let repositoryId = tl.getVariable('Build.Repository.ID');  
        let pullRequestIdString = tl.getVariable('System.PullRequest.PullRequestId');

        if (pullRequestIdString === undefined) {
            // If the build is not pull request, do nothing. 
            return; 
        }

        let pullRequestId:number = pullRequestIdString ? parseInt(pullRequestIdString) : 0;
        
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


new CreatePRCommentTask(new ClientFactory()).run();