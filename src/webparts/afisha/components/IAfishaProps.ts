import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MSGraphClientFactory } from "@microsoft/sp-http";

export interface IAfishaProps {
  description: string;
  clientFactory: MSGraphClientFactory;
}
