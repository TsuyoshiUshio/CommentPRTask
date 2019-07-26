import * as assert from 'assert';
import * as sinon from 'sinon';
import rewiremock from 'rewiremock';
import { should as Should, expect } from 'chai';
import { IGitApi, GitApi } from 'azure-devops-node-api/GitApi';

import * as GitInterfaces from "azure-devops-node-api/interfaces/GitInterfaces";


var should = Should();

let debugMessages: string[] = [];
let variables: {[key: string]: string} = {};
let inputs: {[key: string]: string} = {};

rewiremock('azure-pipelines-task-lib')
    .with({
        'debug': sinon.stub().callsFake(m => debugMessages.push(m)),
        'getInput': sinon.stub().callsFake(i => { return inputs[i] || null; }),
        'getVariable': sinon.stub().callsFake(v => { return variables[v] || null; }),
        'getEndpointAuthorizationParameter': () => "fooPAT",
        'loc': sinon.stub().returnsArg(0)
    });

rewiremock.enable();

import { IClientFactory, CreatePRCommentTask }  from '../Src/task';

class ClientFactoryMock implements IClientFactory {
  called: boolean = false;
  createdCommentThread: GitInterfaces.GitPullRequestCommentThread = {};
  createdRepositoryId: string = "";
  createdPullRequestId: number = 0;
  expectedThreds: GitInterfaces.GitPullRequestCommentThread[] = [];
  
  public async create(pat:string): Promise<IGitApi> {
    let gitApiStub = <IGitApi> {
      getThreads: (repositoryId: string, pullRequestId: number, project?: string, iteration?: number, baseIteration?: number): Promise<GitInterfaces.GitPullRequestCommentThread[]> => {
        return new Promise<GitInterfaces.GitPullRequestCommentThread[]>(
          (resolve: (value?:GitInterfaces.GitPullRequestCommentThread[]) => void, reject: (reason?:any) => void) => {
            resolve(this.expectedThreds);
          });
      },
      createThread: (commentThread: GitInterfaces.GitPullRequestCommentThread, repositoryId: string, pullRequestId: number, project?: string): Promise<GitInterfaces.GitPullRequestCommentThread> => {
        return new Promise<GitInterfaces.GitPullRequestCommentThread>(
          (resolve: (value?:GitInterfaces.GitPullRequestCommentThread) => void, reject: (reason?:any) => void) => {
            this.createdCommentThread = commentThread;
            this.createdRepositoryId = repositoryId;
            this.createdPullRequestId = pullRequestId; 
            this.called = true; 
            resolve(undefined); // currently not used. 
          });
      }
    };
    return gitApiStub; 
  }
}

describe('CommentPRTask Test', function () {

  
  it('run all inputs function', async () => {
    let factoryMock: IClientFactory = new ClientFactoryMock();
    variables["Build.Repository.ID"] = '3';
    variables['System.PullRequest.PullRequestId'] = '4';
    inputs['AzureDevOpsService'] = 'devopspat';
    inputs['Comment'] = 'foo';

    let commentTask = new CreatePRCommentTask(factoryMock);
    await commentTask.run();

    (factoryMock as ClientFactoryMock).called.should.be.true;
  });

  it('run substitution', async() => {
    let factoryMock: IClientFactory = new ClientFactoryMock();
    variables["Build.Repository.ID"] = '3';
    variables['System.PullRequest.PullRequestId'] = '4';
    variables['Bar'] = 'bar';
    inputs['AzureDevOpsService'] = 'devopspat';
    inputs['Comment'] = 'foo, $(Bar)';

    let commentTask = new CreatePRCommentTask(factoryMock);
    await commentTask.run();
    let comments = (factoryMock as ClientFactoryMock).createdCommentThread.comments;
    if (comments !== undefined) {
      let content = comments[0].content
      if (content !== undefined) {
        content.should.be.equal('foo, bar');
      } else {
        assert.fail('content is undefined');
      }
    } else {
      assert.fail('comments is undefined');
    }
      
  });

  it("ignored if it is non-pullrequest pipeline", async () => {
    let factoryMock: IClientFactory = new ClientFactoryMock();
    variables = {};
    variables["Build.Repository.ID"] = '3';
    inputs['AzureDevOpsService'] = 'devopspat';
    inputs['Comment'] = 'foo';

    let commentTask = new CreatePRCommentTask(factoryMock);
    await commentTask.run();

    (factoryMock as ClientFactoryMock).called.should.be.false;
  });

  it("suppress the comment if there is already created", async () =>  {
    let factoryMock: IClientFactory = new ClientFactoryMock();
    variables["Build.Repository.ID"] = '3';
    variables['System.PullRequest.PullRequestId'] = '4';
    inputs['AzureDevOpsService'] = 'devopspat';
    inputs['Comment'] = 'foo';
    let commentObject = <GitInterfaces.Comment> {
      content : 'foo'            
  };
    let thread : GitInterfaces.GitPullRequestCommentThread = <GitInterfaces.GitPullRequestCommentThread> {
      comments: [
          commentObject
      ]
  };
    (factoryMock as ClientFactoryMock).expectedThreds = [thread];

    let commentTask = new CreatePRCommentTask(factoryMock);
    await commentTask.run();

    (factoryMock as ClientFactoryMock).called.should.be.false;
  });

});

rewiremock.disable();