import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity, ObjectIdType } from '../base.repository';

export enum TraceType {
  VISIT = 'visit',
  WIDGET = 'widget',
  FLOW = 'flow',
}

/**
 * SCHEMA
 */
const FingerprintComponentsSchema = Type.Object({
  fonts: Type.Object({
    value: Type.Array(Type.String()),
  }),
  domBlockers: Type.Object({}),
  fontPreferences: Type.Object({
    value: Type.Object({
      default: Type.String(),
      apple: Type.String(),
      serif: Type.String(),
      sans: Type.String(),
      mono: Type.String(),
      min: Type.String(),
      system: Type.String(),
    }),
  }),
  audio: Type.Object({
    value: Type.String(),
  }),
  screenFrame: Type.Object({
    value: Type.Array(Type.String()),
  }),
  canvas: Type.Object({
    value: Type.Object({
      winding: Type.String(),
      geometry: Type.String(),
      text: Type.String(),
    }),
  }),
  osCpu: Type.Object({}),
  languages: Type.Object({
    value: Type.Array(Type.Array(Type.String())),
  }),
  colorDepth: Type.Object({
    value: Type.String(),
  }),
  deviceMemory: Type.Object({
    value: Type.String(),
  }),
  screenResolution: Type.Object({
    value: Type.Array(Type.String()),
  }),
  hardwareConcurrency: Type.Object({
    value: Type.String(),
  }),
  timezone: Type.Object({
    value: Type.String(),
  }),
  sessionStorage: Type.Object({
    value: Type.String(),
  }),
  localStorage: Type.Object({
    value: Type.String(),
  }),
  indexedDB: Type.Object({
    value: Type.String(),
  }),
  openDatabase: Type.Object({
    value: Type.String(),
  }),
  cpuClass: Type.Object({}),
  platform: Type.Object({
    value: Type.String(),
  }),
  plugins: Type.Object({
    value: Type.Array(
      Type.Object({
        name: Type.String(),
        description: Type.String(),
        mimeTypes: Type.Array(
          Type.Object({
            type: Type.String(),
            suffixes: Type.String(),
          })
        ),
      })
    ),
  }),
  touchSupport: Type.Object({
    value: Type.Object({
      maxTouchPoints: Type.String(),
      touchEvent: Type.String(),
      touchStart: Type.String(),
    }),
  }),
  vendor: Type.Object({
    value: Type.String(),
  }),
  vendorFlavors: Type.Object({
    value: Type.Array(Type.String()),
  }),
  colorGamut: Type.Object({
    value: Type.String(),
  }),
  invertedColors: Type.Object({}),
  forcedColors: Type.Object({
    value: Type.String(),
  }),
  monochrome: Type.Object({
    value: Type.String(),
  }),
  contrast: Type.Object({
    value: Type.String(),
  }),
  reducedMotion: Type.Object({
    value: Type.String(),
  }),
  reducedTransparency: Type.Object({
    value: Type.String(),
  }),
  hdr: Type.Object({
    value: Type.String(),
  }),
  math: Type.Object({
    value: Type.Object({
      acos: Type.String(),
      acosh: Type.String(),
      acoshPf: Type.String(),
      asin: Type.String(),
      asinh: Type.String(),
      asinhPf: Type.String(),
      atanh: Type.String(),
      atanhPf: Type.String(),
      atan: Type.String(),
      sin: Type.String(),
      sinh: Type.String(),
      sinhPf: Type.String(),
      cos: Type.String(),
      cosh: Type.String(),
      coshPf: Type.String(),
      tan: Type.String(),
      tanh: Type.String(),
      tanhPf: Type.String(),
      exp: Type.String(),
      expm1: Type.String(),
      expm1Pf: Type.String(),
      log1p: Type.String(),
      log1pPf: Type.String(),
      powPI: Type.String(),
    }),
  }),
  pdfViewerEnabled: Type.Object({
    value: Type.String(),
  }),
  architecture: Type.Object({
    value: Type.String(),
  }),
  applePay: Type.Object({
    value: Type.String(),
  }),
  privateClickMeasurement: Type.Object({}),
  audioBaseLatency: Type.Object({
    value: Type.String(),
  }),
  dateTimeLocale: Type.Object({
    value: Type.String(),
  }),
  webGlBasics: Type.Object({
    value: Type.Object({
      version: Type.String(),
      vendor: Type.String(),
      vendorUnmasked: Type.String(),
      renderer: Type.String(),
      rendererUnmasked: Type.String(),
      shadingLanguageVersion: Type.String(),
    }),
  }),
  webGlExtensions: Type.Object({
    value: Type.Object({
      contextAttributes: Type.Array(Type.String()),
      parameters: Type.Array(Type.String()),
      shaderPrecisions: Type.Array(Type.String()),
      extensions: Type.Array(Type.String()),
      extensionParameters: Type.Array(Type.String()),
      unsupportedExtensions: Type.Array(Type.String()),
    }),
  }),
});

export const FingerprintSchema = Type.Object({
  fingerprintId: Type.String(),
  components: Type.Optional(FingerprintComponentsSchema),
});

export const PageSchema = Type.Object({
  domain: Type.String(),
  path: Type.String(),
  search: Type.Optional(Type.String()),
  referer: Type.Optional(Type.String()),
});

export const GeoSchema = Type.Object({
  ip: Type.String(),
  city: Type.String(),
  postal: Type.String(),
  region: Type.String(),
  country: Type.String(),
  latitude: Type.Number(),
  longitude: Type.Number(),
  timezone: Type.String(),
  currentTime: Type.String(),
  isp: Type.String(),
});

export const TraceSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    type: Type.String(),
    traceId: Type.String(),
    fingerprint: FingerprintSchema,
    geo: Type.Optional(GeoSchema),
    widgetKey: Type.String(),
    widgetId: Type.String(),
    hookId: Type.String(),
  }),
]);

export const VisitTraceSchema = Type.Intersect([
  TraceSchema,
  Type.Object({
    type: Type.Literal(TraceType.VISIT),
    page: PageSchema,
  }),
]);

export const WidgetTraceSchema = Type.Intersect([
  TraceSchema,
  Type.Object({
    type: Type.Literal(TraceType.WIDGET),
    sourceWidgetKey: Type.String(),
    sourceWidgetId: Type.String(),
    sourceHookId: Type.String(),
  }),
]);

export const FlowTraceSchema = Type.Intersect([
  TraceSchema,
  Type.Object({
    type: Type.Literal(TraceType.FLOW),
    campaignId: ObjectIdType,
    utmCampaign: Type.String(),
  }),
]);

export const VisitTraceDtoSchema = Type.Omit(VisitTraceSchema, ['_id', 'createdAt', 'updatedAt', 'type', 'widgetId', 'hookId']);
export const WidgetTraceDtoSchema = Type.Omit(WidgetTraceSchema, [
  '_id',
  'createdAt',
  'updatedAt',
  'type',
  'widgetId',
  'hookId',
  'sourceWidgetId',
  'sourceHookId',
]);
export const FlowTraceDtoSchema = Type.Omit(FlowTraceSchema, ['_id', 'createdAt', 'updatedAt', 'type', 'widgetId', 'hookId', 'campaignId']);

/**
 * MODEL
 */
export type Trace = Static<typeof TraceSchema> & IEntity;
export type VisitTrace = Static<typeof VisitTraceSchema> & IEntity;
export type WidgetTrace = Static<typeof WidgetTraceSchema> & IEntity;
export type FlowTrace = Static<typeof FlowTraceSchema> & IEntity;
export type FingerprintComponents = Static<typeof FingerprintComponentsSchema>;
export type Fingerprint = Static<typeof FingerprintSchema>;
export type Page = Static<typeof PageSchema>;
export type Geo = Static<typeof GeoSchema>;

/**
 * DTO
 */
export type VisitTraceDto = typeof VisitTraceDtoSchema.static;
export type WidgetTraceDto = typeof WidgetTraceDtoSchema.static;
export type FlowTraceDto = typeof FlowTraceDtoSchema.static;
