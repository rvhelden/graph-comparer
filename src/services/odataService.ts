import type { IPublicClientApplication } from "@azure/msal-browser";
import { customersApiRequest, odataConfig } from "../authConfig";
import {
  CustomerSchema,
  ODataResponseSchema,
  type Customer,
  type ODataQueryOptions,
  type ODataResponse,
} from "../schemas/customerSchemas";

class ODataService {
  private msalInstance: IPublicClientApplication;
  
  constructor(msalInstance: IPublicClientApplication) {
    this.msalInstance = msalInstance;
  }

  private async getAccessToken(): Promise<string> {
    try {
      const account = this.msalInstance.getAllAccounts()[0];
      if (!account) {
        throw new Error("No account found");
      }

      const response = await this.msalInstance.acquireTokenSilent({
        ...customersApiRequest,
        account,
      });

      return response.accessToken;
    } catch {
      // If silent token acquisition fails, try popup
      const response = await this.msalInstance.acquireTokenPopup(customersApiRequest);
      return response.accessToken;
    }
  }

  private buildQueryString(options: ODataQueryOptions): string {
    const params = new URLSearchParams();
    
    if (options.$skip !== undefined) {
      params.append("$skip", options.$skip.toString());
    }
    
    if (options.$top !== undefined) {
      params.append("$top", options.$top.toString());
    }
    
    if (options.$orderby) {
      params.append("$orderby", options.$orderby);
    }
    
    if (options.$filter) {
      params.append("$filter", options.$filter);
    }
    
    if (options.$count) {
      params.append("$count", "true");
    }

    return params.toString();
  }

  async getCustomers(options: ODataQueryOptions = {}): Promise<ODataResponse<Customer>> {
    const accessToken = await this.getAccessToken();
    const queryString = this.buildQueryString(options);
    const url = `${odataConfig.baseUrl}${odataConfig.customersEndpoint}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const CustomersResponseSchema = ODataResponseSchema(CustomerSchema);
    
    try {
      return CustomersResponseSchema.parse(data);
    } catch (error) {
      console.error("Failed to validate customer response:", error);
      // Return the data anyway in case of validation errors, but log the issue
      return data as ODataResponse<Customer>;
    }
  }

  async getCustomer(id: string): Promise<Customer> {
    const accessToken = await this.getAccessToken();
    const url = `${odataConfig.baseUrl}${odataConfig.customersEndpoint}(${id})`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    try {
      return CustomerSchema.parse(data);
    } catch (error) {
      console.error("Failed to validate customer response:", error);
      // Return the data anyway in case of validation errors, but log the issue
      return data as Customer;
    }
  }
}

export default ODataService;