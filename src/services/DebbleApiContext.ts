import type { IPublicClientApplication } from '@azure/msal-browser';
import { ODataV4Context } from 'ts-odata-client';
import { customersApiRequest, odataConfig } from '../authConfig';
import type { Customer, DeploymentEnvironment, Ring } from '../schemas/models';

export class DebbleApiContext extends ODataV4Context {
    private msalInstance: IPublicClientApplication;

    constructor(msalInstance: IPublicClientApplication) {
        super(odataConfig.baseUrl, {
            requestInit: async () => {
                const accessToken = await this.getAccessToken();

                return {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                };
            }
        });
        this.msalInstance = msalInstance;
    }

    private async getAccessToken(): Promise<string> {
        try {
            const account = this.msalInstance.getAllAccounts()[0];
            if (!account) {
                throw new Error('No account found');
            }

            const response = await this.msalInstance.acquireTokenSilent({
                ...customersApiRequest,
                account
            });

            return response.accessToken;
        } catch {
            // If silent token acquisition fails, try popup
            const response = await this.msalInstance.acquireTokenPopup(customersApiRequest);
            return response.accessToken;
        }
    }

    get customers() {
        return this.createQuery<Customer>(odataConfig.customersEndpoint);
    }

    get deploymentEnvironments() {
        return this.createQuery<DeploymentEnvironment>(odataConfig.deploymentEnvironmentsEndpoint);
    }

    get rings() {
        return this.createQuery<Ring>(odataConfig.ringsEndpoint);
    }
}
