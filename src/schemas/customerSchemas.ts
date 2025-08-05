import { z } from "zod";

// Enum schemas
export const LanguageSchema = z.enum(["1043", "1033"]).transform((val) => parseInt(val)); // Dutch = 1043, English = 1033

// Base schemas - matching API PascalCase format
export const CustomerSettingsSchema = z.object({
  CustomerId: z.string().uuid(),
  Language: z.string(), // API returns "0" as string, not enum
  TenantLanguage: z.string(), // API returns "0" as string, not enum
  SiteThemeName: z.string().nullable(),
  SiteDesignSecret: z.string().nullable(),
});

export const CWPCustomerSettingSchema = z.object({
  id: z.number(),
  customerId: z.string().uuid(),
  name: z.string(),
  value: z.string(),
});

export const CWPFeatureSchema = z.object({
  customerId: z.string().uuid(),
  enabled: z.boolean(),
  applyTemplatesOnUpdate: z.boolean(),
  cwpSystem: z.number(),
  externalSystemTenantId: z.string().optional(),
  externalSystemClientId: z.string().optional(),
  externalSystemCertificateName: z.string().optional(),
  hooksBaseUrl: z.string().url().optional(),
  endpointUrl: z.string().url(),
  defaultOwners: z.string().optional(),
  lastSyncTime: z.string().datetime().optional(),
  settings: z.array(CWPCustomerSettingSchema).default([]),
});

export const TeamsGovernanceFeatureSchema = z.object({
  customerId: z.string().uuid(),
  enabled: z.boolean(),
  siteApproval: z.boolean(),
  siteApprovalGroup: z.string().optional(),
  createSitesUnder: z.string().optional(),
  createTeamSitesUnder: z.string().optional(),
  useAccountForSensitivityLabel: z.boolean(),
  sensitivityLabelAccount: z.string().optional(),
  archivalEnabled: z.boolean(),
  reportingEnabled: z.boolean(),
  groupMemberSyncEnabled: z.boolean(),
});

export const WorkplaceFeatureSchema = z.object({
  customerId: z.string().uuid(),
  enabled: z.boolean(),
  siteCreatorGroup: z.string().optional(),
  siteSupportGroup: z.string().optional(),
  siteAdministratorsGroup: z.string().optional(),
  siteVisitorsGroup: z.string().optional(),
  additionalVisitorGroups: z.string().optional(),
  additionalMemberGroups: z.string().optional(),
  additionalOwnerGroups: z.string().optional(),
  url: z.string().url().optional(),
});

export const KnowledgebaseFeatureSchema = z.object({
  customerId: z.string().uuid(),
  enabled: z.boolean(),
  urls: z.array(z.string().url()).default([]),
});

export const TopDeskFeatureSchema = z.object({
  customerId: z.string().uuid(),
  enabled: z.boolean(),
});

// Main Customer schema - matching API PascalCase format
export const CustomerSchema = z.object({
  Id: z.string().uuid(),
  Name: z.string().min(1),
  RingName: z.string().nullable(),
  TenantDomain: z.string().min(1),
  SharePointDomain: z.string().min(1),
  TenantId: z.string().uuid(),
  TenantName: z.string().min(1),
  ClientId: z.string().nullable(),
  Settings: CustomerSettingsSchema,
  Ring: z.any().nullable(), // Ring object structure unknown
  Workplace: WorkplaceFeatureSchema.nullable(),
  TeamsGovernance: TeamsGovernanceFeatureSchema.nullable(),
  KnowledgeBase: KnowledgebaseFeatureSchema.nullable(),
  CWP: CWPFeatureSchema.nullable(),
  TopDesk: TopDeskFeatureSchema.nullable(),
  CreatedOn: z.string(), // API returns datetime as string
  CreatedBy: z.string().uuid(),
  CreatedByName: z.string().nullable(),
  ModifiedOn: z.string(), // API returns datetime as string
  ModifiedBy: z.string().uuid(),
  ModifiedByName: z.string().nullable(),
  IsDeleted: z.boolean(),
});

// OData query schemas
export const ODataQueryOptionsSchema = z.object({
  $skip: z.number().optional(),
  $top: z.number().optional(),
  $orderby: z.string().optional(),
  $filter: z.string().optional(),
  $count: z.boolean().optional(),
});

export const ODataResponseSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    "@odata.context": z.string(),
    "@odata.count": z.number().optional(),
    value: z.array(valueSchema),
  });

// Type exports
export type CustomerSettings = z.infer<typeof CustomerSettingsSchema>;
export type CWPCustomerSetting = z.infer<typeof CWPCustomerSettingSchema>;
export type CWPFeature = z.infer<typeof CWPFeatureSchema>;
export type TeamsGovernanceFeature = z.infer<typeof TeamsGovernanceFeatureSchema>;
export type WorkplaceFeature = z.infer<typeof WorkplaceFeatureSchema>;
export type KnowledgebaseFeature = z.infer<typeof KnowledgebaseFeatureSchema>;
export type TopDeskFeature = z.infer<typeof TopDeskFeatureSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type ODataQueryOptions = z.infer<typeof ODataQueryOptionsSchema>;
export type ODataResponse<T> = {
  "@odata.context": string;
  "@odata.count"?: number;
  value: T[];
};