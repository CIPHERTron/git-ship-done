import { Octokit } from '@octokit/rest'
import fetch from 'node-fetch';
import * as dotenv from 'dotenv'

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;

const octokit = new Octokit({
    auth: GITHUB_TOKEN,
    request: {
        fetch
    }
});

export const createGithubIssue = async (title: string, body: string) => {
    try {
        const response = await octokit.issues.create({
            owner: REPO_OWNER!,
            repo: REPO_NAME!,
            title,
            body
        });

        console.log('Created Github Issue', response.data);
        return response.data.number;
    } catch(error) {
        console.log('Error creating github issue: ', error);
        throw error;
    }
};

export const updateGithubIssue = async (issueNumber: number, title: string, body: string) => {
    try {
      await octokit.issues.update({
        owner: REPO_OWNER!,
        repo: REPO_NAME!,
        issue_number: issueNumber,
        title,
        body,
      });
  
      console.log('Updated GitHub Issue', issueNumber);
    } catch (error) {
      console.log('Error updating GitHub issue: ', error);
      throw error;
    }
};

export const closeGithubIssue = async (issueNumber: number) => {
    try {
      await octokit.issues.update({
        owner: REPO_OWNER!,
        repo: REPO_NAME!,
        issue_number: issueNumber,
        state: 'closed',
      });
  
      console.log('Closed GitHub Issue', issueNumber);
    } catch (error) {
      console.log('Error closing GitHub issue: ', error);
      throw error;
    }
};