import { z } from 'zod';

// Enum schemas
export const LanguageSchema = z.enum(['1043', '1033']).transform((val) => parseInt(val)); // Dutch = 1043, English = 1033

// Base schemas - matching API PascalCase format
export const CustomerSettingsSchema = z.object({
    CustomerId: z.uuid(),
    Language: z.string(), // API returns "0" as string, not enum
    TenantLanguage: z.string(), // API returns "0" as string, not enum
    SiteThemeName: z.string().nullable(),
    SiteDesignSecret: z.string().nullable()
});

export const CWPCustomerSettingSchema = z.object({
    Id: z.number(),
    CustomerId: z.uuid(),
    Name: z.string(),
    Value: z.string()
});

export const CWPFeatureSchema = z.object({
    CustomerId: z.uuid(),
    Enabled: z.boolean(),
    ApplyTemplatesOnUpdate: z.boolean(),
    CwpSystem: z.number(),
    ExternalSystemTenantId: z.string().optional(),
    ExternalSystemClientId: z.string().optional(),
    ExternalSystemCertificateName: z.string().optional(),
    HooksBaseUrl: z.string().url().optional(),
    EndpointUrl: z.string().url(),
    DefaultOwners: z.string().optional(),
    LastSyncTime: z.string().datetime().optional(),
    Settings: z.array(CWPCustomerSettingSchema).default([])
});

export const TeamsGovernanceFeatureSchema = z.object({
    CustomerId: z.uuid(),
    Enabled: z.boolean(),
    SiteApproval: z.boolean(),
    SiteApprovalGroup: z.string().optional(),
    CreateSitesUnder: z.string().optional(),
    CreateTeamSitesUnder: z.string().optional(),
    UseAccountForSensitivityLabel: z.boolean(),
    SensitivityLabelAccount: z.string().optional(),
    ArchivalEnabled: z.boolean(),
    ReportingEnabled: z.boolean(),
    GroupMemberSyncEnabled: z.boolean()
});

export const WorkplaceFeatureSchema = z.object({
    CustomerId: z.uuid(),
    Enabled: z.boolean(),
    SiteCreatorGroup: z.string().optional(),
    SiteSupportGroup: z.string().optional(),
    SiteAdministratorsGroup: z.string().optional(),
    SiteVisitorsGroup: z.string().optional(),
    AdditionalVisitorGroups: z.string().optional(),
    AdditionalMemberGroups: z.string().optional(),
    AdditionalOwnerGroups: z.string().optional(),
    Url: z.string().url().optional()
});

export const KnowledgebaseFeatureSchema = z.object({
    CustomerId: z.uuid(),
    Enabled: z.boolean(),
    Urls: z.array(z.string().url()).default([])
});

export const TopDeskFeatureSchema = z.object({
    CustomerId: z.uuid(),
    Enabled: z.boolean()
});

// DeploymentEnvironment schema
export const DeploymentEnvironmentSchema = z.object({
    Name: z.string().min(1),
    Order: z.number().nullable(),
    GitBranch: z.string(),
    CustomerSettingsTable: z.string(),
    NotificationStorageTable: z.string(),
    ClientId: z.string(),
    CertificateName: z.string(),
    SiteDesignAppliedCallbackUrl: z.string(),
    TimeLineServiceUrl: z.string().url(),
    ConnectedWorkplaceUrl: z.string().url(),
    TopDeskApiUrl: z.string().url(),
    LogAnalyticsWorkspaceId: z.string(),
    CreatedOn: z.string(),
    CreatedBy: z.string().uuid(),
    CreatedByName: z.string().nullable(),
    ModifiedOn: z.string(),
    ModifiedBy: z.string().uuid(),
    ModifiedByName: z.string().nullable()
});

// Ring schema
export const RingSchema = z.object({
    Name: z.string().min(1),
    Order: z.number().nullable(),
    DeploymentEnvironmentName: z.string().min(1),
    UpdateEnabled: z.boolean(),
    CreatedOn: z.string(),
    CreatedBy: z.string().uuid(),
    CreatedByName: z.string().nullable(),
    ModifiedOn: z.string(),
    ModifiedBy: z.string().uuid(),
    ModifiedByName: z.string().nullable(),
    DeploymentEnvironment: DeploymentEnvironmentSchema.nullable() // Will be populated for expanded queries
});

// Main Customer schema - matching API PascalCase format
export const CustomerSchema = z.object({
    Id: z.uuid(),
    Name: z.string().min(1),
    RingName: z.string().nullable(),
    TenantDomain: z.string().min(1),
    SharePointDomain: z.string().min(1),
    TenantId: z.string().uuid(),
    TenantName: z.string().min(1),
    ClientId: z.string().nullable(),
    Settings: CustomerSettingsSchema,
    Ring: RingSchema.nullable(),
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
    ModifiedByName: z.string().nullable()
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
export type Ring = z.infer<typeof RingSchema>;
export type DeploymentEnvironment = z.infer<typeof DeploymentEnvironmentSchema>;
