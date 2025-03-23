type MaybePromise<T> = Promise<T> | T;

type Source<TOptions, TValue> = (options: TOptions) => MaybePromise<TValue | (() => MaybePromise<TValue>)>;
type UnknownSources<TOptions> = Record<string, Source<TOptions, unknown>>;
type SourceValue<TSource extends Source<any, any>> = TSource extends Source<any, infer T> ? T : never;
type Component<T> = ({
    value: T;
} | {
    error: unknown;
}) & {
    duration: number;
};
type UnknownComponents = Record<string, Component<unknown>>;
type SourcesToComponents<TSources extends UnknownSources<any>> = {
    [K in keyof TSources]: Component<SourceValue<TSources[K]>>;
};
declare function loadSources<TSourceOptions, TSources extends UnknownSources<TSourceOptions>, TExclude extends string>(sources: TSources, sourceOptions: TSourceOptions, excludeSources: readonly TExclude[], loopReleaseInterval?: number): () => Promise<Omit<SourcesToComponents<TSources>, TExclude>>;
declare function transformSource<TOptions, TValueBefore, TValueAfter>(source: Source<TOptions, TValueBefore>, transformValue: (value: TValueBefore) => TValueAfter): Source<TOptions, TValueAfter>;

declare function getAudioFingerprint(): number | (() => Promise<number>);
declare function getUnstableAudioFingerprint(): number | (() => Promise<number>);

declare function getFonts(): Promise<string[]>;

type PluginMimeTypeData = {
    type: string;
    suffixes: string;
};
type PluginData = {
    name: string;
    description: string;
    mimeTypes: PluginMimeTypeData[];
};
declare function getPlugins(): PluginData[] | undefined;

interface CanvasFingerprint {
    winding: boolean;
    geometry: string;
    text: string;
}
declare function getCanvasFingerprint(): CanvasFingerprint;
declare function getUnstableCanvasFingerprint(skipImages?: boolean): CanvasFingerprint;

type TouchSupport = {
    maxTouchPoints: number;
    touchEvent: boolean;
    touchStart: boolean;
};
declare function getTouchSupport(): TouchSupport;

declare function getOsCpu(): string | undefined;

declare function getLanguages(): string[][];

declare function getColorDepth(): number;

declare function getDeviceMemory(): number | undefined;

type ScreenResolution = [number | null, number | null];
declare function getScreenResolution(): ScreenResolution | undefined;
declare function getUnstableScreenResolution(): ScreenResolution;

type FrameSize = [number | null, number | null, number | null, number | null];
declare function getUnstableScreenFrame(): () => Promise<FrameSize>;
declare function getScreenFrame(): () => Promise<FrameSize | undefined>;

declare function getHardwareConcurrency(): number | undefined;

declare function getTimezone(): string;

declare function getSessionStorage(): boolean;

declare function getLocalStorage(): boolean;

declare function getIndexedDB(): boolean | undefined;

declare function getOpenDatabase(): boolean;

declare function getCpuClass(): string | undefined;

declare function getPlatform(): string;

declare function getVendor(): string;

declare function getVendorFlavors(): string[];

type Options$1 = {
    debug?: boolean;
};
declare function getDomBlockers({ debug }?: Options$1): Promise<string[] | undefined>;

type ColorGamut = 'srgb' | 'p3' | 'rec2020';
declare function getColorGamut(): ColorGamut | undefined;

declare function areColorsInverted(): boolean | undefined;

declare function areColorsForced(): boolean | undefined;

declare function getMonochromeDepth(): number | undefined;

declare function getContrastPreference(): number | undefined;

declare function isMotionReduced(): boolean | undefined;

declare function isTransparencyReduced(): boolean | undefined;

declare function isHDR(): boolean | undefined;

declare function getMathFingerprint(): Record<string, number>;

declare function getFontPreferences(): Promise<Record<string, number>>;

declare function isPdfViewerEnabled(): boolean | undefined;

declare function getArchitecture(): number;

declare function getApplePayState(): 0 | 1 | -1 | -2 | -3;

declare function getPrivateClickMeasurement(): string | undefined;

type WebGlBasicsPayload = {
    version: string;
    vendor: string;
    vendorUnmasked: string;
    renderer: string;
    rendererUnmasked: string;
    shadingLanguageVersion: string;
};
type WebGlExtensionsPayload = {
    contextAttributes: string[];
    parameters: string[];
    shaderPrecisions: string[];
    extensions: string[] | null;
    extensionParameters: string[];
    unsupportedExtensions: string[];
};
type CanvasContext = WebGLRenderingContext & {
    readonly canvas: HTMLCanvasElement;
};
type Options = {
    cache: {
        webgl?: {
            context: CanvasContext | undefined;
        };
    };
};
declare const STATUS_NO_GL_CONTEXT = -1;
declare const STATUS_GET_PARAMETER_NOT_A_FUNCTION = -2;
type SpecialStatus = typeof STATUS_NO_GL_CONTEXT | typeof STATUS_GET_PARAMETER_NOT_A_FUNCTION;
declare function getWebGlBasics({ cache }: Options): WebGlBasicsPayload | SpecialStatus;
declare function getWebGlExtensions({ cache }: Options): WebGlExtensionsPayload | SpecialStatus;
declare function getWebGLContext(cache: Options['cache']): CanvasContext | undefined;

declare function getAudioContextBaseLatency(): number;

declare function getDateTimeLocale(): string | -1 | -2 | -3;

declare const sources: {
    fonts: typeof getFonts;
    domBlockers: typeof getDomBlockers;
    fontPreferences: typeof getFontPreferences;
    audio: typeof getAudioFingerprint;
    screenFrame: typeof getScreenFrame;
    canvas: typeof getCanvasFingerprint;
    osCpu: typeof getOsCpu;
    languages: typeof getLanguages;
    colorDepth: typeof getColorDepth;
    deviceMemory: typeof getDeviceMemory;
    screenResolution: typeof getScreenResolution;
    hardwareConcurrency: typeof getHardwareConcurrency;
    timezone: typeof getTimezone;
    sessionStorage: typeof getSessionStorage;
    localStorage: typeof getLocalStorage;
    indexedDB: typeof getIndexedDB;
    openDatabase: typeof getOpenDatabase;
    cpuClass: typeof getCpuClass;
    platform: typeof getPlatform;
    plugins: typeof getPlugins;
    touchSupport: typeof getTouchSupport;
    vendor: typeof getVendor;
    vendorFlavors: typeof getVendorFlavors;
    colorGamut: typeof getColorGamut;
    invertedColors: typeof areColorsInverted;
    forcedColors: typeof areColorsForced;
    monochrome: typeof getMonochromeDepth;
    contrast: typeof getContrastPreference;
    reducedMotion: typeof isMotionReduced;
    reducedTransparency: typeof isTransparencyReduced;
    hdr: typeof isHDR;
    math: typeof getMathFingerprint;
    pdfViewerEnabled: typeof isPdfViewerEnabled;
    architecture: typeof getArchitecture;
    applePay: typeof getApplePayState;
    privateClickMeasurement: typeof getPrivateClickMeasurement;
    audioBaseLatency: typeof getAudioContextBaseLatency;
    dateTimeLocale: typeof getDateTimeLocale;
    webGlBasics: typeof getWebGlBasics;
    webGlExtensions: typeof getWebGlExtensions;
};
type BuiltinComponents = SourcesToComponents<typeof sources>;

interface LoadOptions {
    delayFallback?: number;
    debug?: boolean;
}
interface GetOptions {
    debug?: boolean;
}
interface GetResult {
    visitorId: string;
    components: BuiltinComponents;
    version: string;
}
interface Agent {
    get(options?: Readonly<GetOptions>): Promise<GetResult>;
}
declare function componentsToDebugString(components: UnknownComponents): string;
declare function hashComponents(components: UnknownComponents): string;
declare function prepareForSources(delayFallback?: number): Promise<void>;
declare function load(options?: Readonly<LoadOptions>): Promise<Agent>;

interface Confidence {
    score: number;
    comment?: string;
}

declare function x64hash128(input: string, seed?: number): string;

declare function isTrident(): boolean;
declare function isEdgeHTML(): boolean;
declare function isChromium(): boolean;
declare function isWebKit(): boolean;
declare function isDesktopWebKit(): boolean;
declare function isGecko(): boolean;
declare function getFullscreenElement(): Element | null;
declare function isAndroid(): boolean;
declare function isSamsungInternet(): boolean;

declare function withIframe<T>(action: (iframe: HTMLIFrameElement, iWindow: typeof window) => MaybePromise<T>, initialHtml?: string, domPollInterval?: number): Promise<T>;

declare const _default: {
    load: typeof load;
    hashComponents: typeof hashComponents;
    componentsToDebugString: typeof componentsToDebugString;
};

declare const murmurX64Hash128: typeof x64hash128;

export { Agent, BuiltinComponents, Component, Confidence, GetOptions, GetResult, LoadOptions, Source, SourcesToComponents, UnknownComponents, UnknownSources, componentsToDebugString, _default as default, getFullscreenElement, getUnstableAudioFingerprint, getUnstableCanvasFingerprint, getUnstableScreenFrame, getUnstableScreenResolution, getWebGLContext, hashComponents, isAndroid, isChromium, isDesktopWebKit, isEdgeHTML, isGecko, isSamsungInternet, isTrident, isWebKit, load, loadSources, murmurX64Hash128, prepareForSources, sources, transformSource, withIframe };
