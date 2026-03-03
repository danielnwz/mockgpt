export type Language = 'en' | 'de' | 'es' | 'fr' | 'it' | 'pt';



// Global variable to hold current language - will be updated by context
let currentLanguage: Language = 'en';

const translations = {
  en: {
    // Header
    help: 'Help',
    feedback: 'Feedback',
    about: 'About',
    changeLanguage: 'Change language',

    // Home Page
    startConversation: 'Start a conversation...',
    lastUsed: 'Last used',
    discoverAll: 'Discover all',

    // Sidebar
    site_title: 'MUCGPT',
    assistant_settings: 'Assistant Settings',
    settings: 'Settings',
    create_assistant: 'Create Assistant',
    import_assistant_btn: 'Import Assistant',
    home: 'Home',
    assistants: 'Assistants',
    newChat: 'New Chat',
    chatHistory: 'Chat History',
    deleteChat: 'Delete Chat',
    expandSidebar: 'Expand Sidebar',
    collapseSidebar: 'Collapse Sidebar',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    feedbackPlaceholder: 'Your feedback...',
    feedbackThankYou: 'Thanks for your feedback!',
    aboutDescription: 'About this application...',
    featureCustomAssistants: 'Custom Assistants',
    featureConfigureBehavior: 'Configure Behavior',
    featureShareAssistants: 'Share Assistants',
    featureOrganizeConversations: 'Organize Conversations',
    chooseAIForChat: 'Choose AI for this chat',

    // Assistant Panel
    subscribed: 'Subscribed',
    yours: 'Yours',
    noSubscriptionsYet: 'No subscriptions yet',
    starAssistantsToSee: 'Star assistants to see them here',
    createFirstAssistant: 'Create your first assistant!',
    buildCustomAssistants: 'Build custom AI assistants tailored to your specific needs and workflows',
    createAssistant: 'Create Assistant',
    discoverAllAssistants: 'Discover All Assistants',
    noAssistantsCreated: 'No assistants created',
    createFirstToGetStarted: 'Create your first assistant to get started',

    // Chat Window
    chat: 'Chat',
    model: 'Model:',
    selectAIModel: 'Select AI Model',
    chooseWhichAI: 'Choose which AI to use for this chat',
    chatSettings: 'Chat Settings',
    customizeAIResponses: 'Customize AI responses for this chat',
    customizeHowAI: 'Customize how the AI responds to your messages',
    responseStyle: 'Response Style',
    chooseResponseCreativity: 'Choose how creative or focused the responses should be',
    chooseCreativeOrFocused: 'Choose how creative or focused the responses should be',
    precise: 'Precise',
    balanced: 'Balanced',
    creative: 'Creative',
    customInstructions: 'Custom Instructions',
    tellAIHowToBehave: 'Tell the AI how to behave or what to focus on',
    customInstructionsPlaceholder: 'Example: You are a helpful assistant who explains things simply and clearly...',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    readyToChat: 'Ready to chat?',
    startConversationBelow: 'Start the conversation by typing a message below!',
    hereToHelp: "I'm here to help! Ask me anything or try one of the quick prompts below.",
    quickPrompts: 'Quick Prompts:',
    typeYourMessage: 'Type your message...',
    send: 'Send',

    // Assistant Discovery
    standardMode: 'No sensitive data',
    typeStandardMessage: 'No sensitive data...',
    typeSecureMessage: 'Secure Mode • Safe for sensitive data...',
    discoverAssistants: 'Discover Assistants',
    browseAndUse: 'Browse and use AI assistants for your workflows',
    import: 'Import',
    createNew: 'Create New',
    searchAssistants: 'Search assistants by name, description, or tools...',
    all: 'All',
    recommended: 'Recommended',
    found: 'Found',
    assistant: 'assistant',
    noAssistantsFound: 'No assistants found',
    tryAdjusting: 'Try adjusting your search or filters',
    viewDetails: 'View details',
    editAssistant: 'Edit assistant',
    deleteAssistant: 'Delete assistant',
    subscribe: 'Subscribe',
    unsubscribe: 'Unsubscribe',
    startChat: 'Start Chat',
    edit: 'Edit',
    description: 'Description',
    systemPrompt: 'System Prompt',
    availableTools: 'Available Tools',
    mode: 'mode',

    // Assistant Editor
    editAssistantTitle: 'Edit Assistant',
    createNewAssistant: 'Create New Assistant',
    basicInformation: 'Basic Information',
    icon: 'Icon',
    name: 'Name',
    namePlaceholder: 'e.g., Code Assistant',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Brief description of what this assistant does',
    behaviorConfiguration: 'Behavior & Configuration',
    systemPromptLabel: 'System Prompt',
    addDescriptionFirst: 'Add a description first',
    generateWithAI: 'Generate with AI',
    generating: 'Generating...',
    addDescriptionToUse: 'Add a description to use AI-generated system prompts',
    systemPromptPlaceholder: "Define the assistant's behavior and personality",
    responseBehavior: 'Response Behavior',
    toolsFeatures: 'Tools & Features',
    allowedTools: 'Allowed Tools',
    selectWhichTools: 'Select which tools this assistant can use',
    quickPromptsLabel: 'Quick Prompts',
    addSuggestedPrompts: 'Add suggested prompts for users. Drag to reorder.',
    addNewQuickPrompt: 'Add a new quick prompt...',
    updateAssistant: 'Update Assistant',
    cancelAndDiscard: 'Cancel and discard changes',
    publish: 'Publish',
    export: 'Export',
    livePreview: 'Live Preview',
    testYourAssistant: 'Test your assistant configuration in real-time',

    // Tool Names
    codeInterpreter: 'Code Interpreter',
    search: 'Search',
    webBrowser: 'Web Browser',
    imageGeneration: 'Image Generation',
    fileUpload: 'File Upload',
    dataAnalysis: 'Data Analysis',

    // Response Behavior Descriptions
    preciseDescription: 'Focused and accurate responses with minimal creativity',
    balancedDescription: 'A good mix of accuracy and creativity',
    creativeDescription: 'More varied and imaginative responses',

    // Model Descriptions
    gpt4Description: 'Most capable, best for complex tasks',
    gpt35Description: 'Fast and efficient for simple tasks',
    claude3OpusDescription: 'Powerful reasoning and analysis',
    claude3SonnetDescription: 'Balanced speed and capability',
    llama370bDescription: 'Open source, good for most tasks',
    mistralLargeDescription: 'Strong at coding and analysis',

    // Modals
    helpModal: 'Help',
    gettingStarted: 'Getting Started:',
    clickNewChat: 'Click "New Chat" or select an assistant to begin a conversation.',
    assistantsSection: 'Assistants:',
    browseCommunity: 'Browse community assistants or create your own with custom settings.',
    chatHistorySection: 'Chat History:',
    accessPrevious: 'Access your previous conversations from the sidebar.',
    customizationSection: 'Customization:',
    eachAssistant: 'Each assistant can have its own system prompt, temperature, and tool access.',
    close: 'Close',
    sendFeedback: 'Send Feedback',
    tellUsWhatYouThink: 'Tell us what you think...',
    submit: 'Submit',
    thankYouFeedback: 'Thank you for your feedback!',
    aboutMUCGPT: 'About MUCGPT',
    mucgptDescription: 'MUCGPT is a platform for creating and managing custom AI assistants powered by your own hosted LLMs.',
    features: 'Features:',
    createCustomAssistants: 'Create custom assistants with unique personalities',
    configureResponse: 'Configure response behavior and tools',
    shareAssistants: 'Share assistants with specific departments',
    organizeConversations: 'Organize conversations with chat history',
    version: 'Version 1.0.0',

    // Delete Confirmation
    areYouSure: 'Are you sure you want to delete',

    // Welcome Messages
    welcomeMessages: [
      {
        greeting: "Hey Daniel! 👋",
        message: "Ready to chat with some AI that actually gets you?"
      },
      {
        greeting: "Welcome back, Daniel! 🚀",
        message: "Let's make today ridiculously productive!"
      },
      {
        greeting: "Daniel's in the house! 🎉",
        message: "Your AI assistants have been eagerly waiting for you"
      },
      {
        greeting: "Good to see you, Daniel! ☕",
        message: "Coffee's brewing, and so are some brilliant ideas"
      },
      {
        greeting: "Hey Daniel! 🌟",
        message: "Time to turn those wild ideas into reality"
      },
      {
        greeting: "Daniel! 💡",
        message: "Your personal AI squad is ready for action"
      },
      {
        greeting: "What's up, Daniel? 🎯",
        message: "Let's tackle some challenges together today"
      },
      {
        greeting: "Daniel's arrived! 🔥",
        message: "The AIs have been practicing their best responses"
      },
    ],
    create_btn: 'Create',
    cancel_btn: 'Cancel',
    success_msg: 'Assistant created successfully',
    import_assistant: {
      title: 'Import Assistant',
      description: 'Upload an assistant configuration file (.json) to add it to your collection.',
      dragDrop: 'Drag and drop your JSON file here',
      clickToBrowse: 'or click to browse',
      info: 'The file should be a valid JSON exported from MUCGPT containing the assistant\'s configuration. It will be added to your personal workspace.',
      cancel: 'Cancel',
    },
  },
  de: {
    // Header
    help: 'Hilfe',
    feedback: 'Feedback',
    about: 'Über',
    changeLanguage: 'Sprache ändern',

    // Home Page
    startConversation: 'Unterhaltung beginnen...',
    lastUsed: 'Zuletzt verwendet',
    discoverAll: 'Alle entdecken',

    // Sidebar
    site_title: 'MUCGPT',
    assistant_settings: 'Assistenten-Einstellungen',
    settings: 'Einstellungen',
    create_assistant: 'Assistent erstellen',
    import_assistant_btn: 'Assistent importieren',
    home: 'Startseite',
    assistants: 'Assistenten',
    newChat: 'Neuer Chat',
    chatHistory: 'Chat-Verlauf',

    // Assistant Panel
    subscribed: 'Abonniert',
    yours: 'Deine',
    noSubscriptionsYet: 'Noch keine Abonnements',
    starAssistantsToSee: 'Markiere Assistenten mit einem Stern, um sie hier zu sehen',
    createFirstAssistant: 'Erstelle deinen ersten Assistenten!',
    buildCustomAssistants: 'Erstelle benutzerdefinierte KI-Assistenten, die auf deine spezifischen Bedürfnisse zugeschnitten sind',
    createAssistant: 'Assistent erstellen',
    discoverAllAssistants: 'Alle Assistenten entdecken',
    noAssistantsCreated: 'Keine Assistenten erstellt',
    createFirstToGetStarted: 'Erstelle deinen ersten Assistenten, um loszulegen',

    // Chat Window
    chat: 'Chat',
    model: 'Modell:',
    selectAIModel: 'KI-Modell auswählen',
    chooseWhichAI: 'Wähle welche KI für diesen Chat verwendet werden soll',
    chatSettings: 'Chat-Einstellungen',
    customizeAIResponses: 'Passe die KI-Antworten für diesen Chat an',
    customizeHowAI: 'Passe an, wie die KI auf deine Nachrichten antwortet',
    responseStyle: 'Antwort-Stil',
    chooseResponseCreativity: 'Wähle, wie kreativ oder fokussiert die Antworten sein sollen',
    chooseCreativeOrFocused: 'Wähle, wie kreativ oder fokussiert die Antworten sein sollen',
    precise: 'Präzise',
    balanced: 'Ausgewogen',
    creative: 'Kreativ',
    customInstructions: 'Benutzerdefinierte Anweisungen',
    tellAIHowToBehave: 'Teile der KI mit, wie sie sich verhalten oder worauf sie sich konzentrieren soll',
    customInstructionsPlaceholder: 'Beispiel: Du bist ein hilfreicher Assistent, der Dinge einfach und klar erklärt...',
    saveChanges: 'Änderungen speichern',
    cancel: 'Abbrechen',
    readyToChat: 'Bereit zum Chatten?',
    startConversationBelow: 'Beginne die Unterhaltung, indem du unten eine Nachricht eingibst!',
    hereToHelp: 'Ich bin hier um zu helfen! Frag mich alles oder probiere eine der Schnell-Anfragen unten.',
    quickPrompts: 'Schnell-Anfragen:',
    typeYourMessage: 'Gib deine Nachricht ein...',
    send: 'Senden',

    // Assistant Discovery
    standardMode: 'Keine sensiblen Daten',
    typeStandardMessage: 'Keine sensiblen Daten...',
    typeSecureMessage: 'Sicherer Modus • Sicher für vertrauliche Daten...',
    discoverAssistants: 'Assistenten entdecken',
    browseAndUse: 'Durchsuche und verwende KI-Assistenten für deine Arbeitsabläufe',
    import: 'Importieren',
    createNew: 'Neu erstellen',
    searchAssistants: 'Assistenten nach Name, Beschreibung oder Tools durchsuchen...',
    all: 'Alle',
    recommended: 'Empfohlen',
    found: 'Gefunden',
    assistant: 'Assistent',
    noAssistantsFound: 'Keine Assistenten gefunden',
    tryAdjusting: 'Versuche deine Suche oder Filter anzupassen',
    viewDetails: 'Details anzeigen',
    editAssistant: 'Assistent bearbeiten',
    deleteAssistant: 'Assistent löschen',
    subscribe: 'Abonnieren',
    unsubscribe: 'Abo beenden',
    startChat: 'Chat starten',
    edit: 'Bearbeiten',
    description: 'Beschreibung',
    systemPrompt: 'System-Prompt',
    availableTools: 'Verfügbare Tools',
    mode: 'Modus',

    // Assistant Editor
    editAssistantTitle: 'Assistent bearbeiten',
    createNewAssistant: 'Neuen Assistenten erstellen',
    basicInformation: 'Grundlegende Informationen',
    icon: 'Symbol',
    name: 'Name',
    namePlaceholder: 'z.B. Code-Assistent',
    descriptionLabel: 'Beschreibung',
    descriptionPlaceholder: 'Kurze Beschreibung, was dieser Assistent macht',
    behaviorConfiguration: 'Verhalten & Konfiguration',
    systemPromptLabel: 'System-Prompt',
    addDescriptionFirst: 'Füge zuerst eine Beschreibung hinzu',
    generateWithAI: 'Mit KI generieren',
    generating: 'Generiere...',
    addDescriptionToUse: 'Füge eine Beschreibung hinzu, um KI-generierte System-Prompts zu verwenden',
    systemPromptPlaceholder: 'Definiere das Verhalten und die Persönlichkeit des Assistenten',
    responseBehavior: 'Antwortverhalten',
    toolsFeatures: 'Tools & Funktionen',
    allowedTools: 'Erlaubte Tools',
    selectWhichTools: 'Wähle aus, welche Tools dieser Assistent verwenden kann',
    quickPromptsLabel: 'Schnell-Anfragen',
    addSuggestedPrompts: 'Füge vorgeschlagene Anfragen für Benutzer hinzu. Zum Sortieren ziehen.',
    addNewQuickPrompt: 'Neue Schnell-Anfrage hinzufügen...',
    updateAssistant: 'Assistent aktualisieren',
    cancelAndDiscard: 'Abbrechen und Änderungen verwerfen',
    publish: 'Veröffentlichen',
    export: 'Exportieren',
    livePreview: 'Live-Vorschau',
    testYourAssistant: 'Teste die Konfiguration deines Assistenten in Echtzeit',

    // Tool Names
    codeInterpreter: 'Code-Interpreter',
    search: 'Suche',
    webBrowser: 'Webbrowser',
    imageGeneration: 'Bildgenerierung',
    fileUpload: 'Datei-Upload',
    dataAnalysis: 'Datenanalyse',

    // Response Behavior Descriptions
    preciseDescription: 'Fokussierte und genaue Antworten mit minimaler Kreativität',
    balancedDescription: 'Eine gute Mischung aus Genauigkeit und Kreativität',
    creativeDescription: 'Abwechslungsreichere und fantasievollere Antworten',

    // Model Descriptions
    gpt4Description: 'Am leistungsfähigsten, am besten für komplexe Aufgaben',
    gpt35Description: 'Schnell und effizient für einfache Aufgaben',
    claude3OpusDescription: 'Leistungsstarkes Denken und Analyse',
    claude3SonnetDescription: 'Ausgewogene Geschwindigkeit und Leistung',
    llama370bDescription: 'Open Source, gut für die meisten Aufgaben',
    mistralLargeDescription: 'Stark beim Programmieren und Analysieren',

    // Modals
    helpModal: 'Hilfe',
    gettingStarted: 'Erste Schritte:',
    clickNewChat: 'Klicke auf "Neuer Chat" oder wähle einen Assistenten aus, um eine Unterhaltung zu beginnen.',
    assistantsSection: 'Assistenten:',
    browseCommunity: 'Durchsuche Community-Assistenten oder erstelle eigene mit benutzerdefinierten Einstellungen.',
    chatHistorySection: 'Chat-Verlauf:',
    accessPrevious: 'Greife über die Seitenleiste auf deine vorherigen Unterhaltungen zu.',
    customizationSection: 'Anpassung:',
    eachAssistant: 'Jeder Assistent kann seinen eigenen System-Prompt, Temperatur und Tool-Zugriff haben.',
    close: 'Schließen',
    sendFeedback: 'Feedback senden',
    tellUsWhatYouThink: 'Sag uns, was du denkst...',
    submit: 'Absenden',
    thankYouFeedback: 'Vielen Dank für dein Feedback!',
    aboutMUCGPT: 'Über MUCGPT',
    mucgptDescription: 'MUCGPT ist eine Plattform zum Erstellen und Verwalten benutzerdefinierter KI-Assistenten, die von deinen eigenen gehosteten LLMs betrieben werden.',
    features: 'Funktionen:',
    createCustomAssistants: 'Erstelle benutzerdefinierte Assistenten mit einzigartigen Persönlichkeiten',
    configureResponse: 'Konfiguriere Antwortverhalten und Tools',
    shareAssistants: 'Teile Assistenten mit bestimmten Abteilungen',
    organizeConversations: 'Organisiere Unterhaltungen mit Chat-Verlauf',
    version: 'Version 1.0.0',

    // Delete Confirmation
    areYouSure: 'Bist du sicher, dass du löschen möchtest',

    // Welcome Messages
    welcomeMessages: [
      {
        greeting: "Moin Daniel! 👋",
        message: "Bock auf ne Runde mit ner KI, die dich checkt?"
      },
      {
        greeting: "Na, wieder da! 🚀",
        message: "Heute wird abgeliefert - worauf hast du Lust?"
      },
      {
        greeting: "Servus Daniel! 🎉",
        message: "Deine KI-Gang wartet schon ungeduldig auf dich"
      },
      {
        greeting: "Hey Daniel! ☕",
        message: "Kaffee läuft, Gehirn läuft, KI läuft - Let's go!"
      },
      {
        greeting: "Na du! 🌟",
        message: "Welche geile Idee setzen wir heute um?"
      },
      {
        greeting: "Daniel! 💡",
        message: "Dein KI-Squad steht bereit - was steht an?"
      },
      {
        greeting: "Was läuft, Daniel? 🎯",
        message: "Heute rocken wir das zusammen!"
      },
      {
        greeting: "Da isser ja! 🔥",
        message: "Die KIs haben extra für dich geübt - kann losgehen!"
      },
    ],
    create_btn: 'Erstellen',
    cancel_btn: 'Abbrechen',
    success_msg: 'Assistent erfolgreich erstellt',
    import_assistant: {
      title: 'Assistent importieren',
      description: 'Laden Sie eine Assistenten-Konfigurationsdatei (.json) hoch, um sie Ihrer Sammlung hinzuzufügen.',
      dragDrop: 'Ziehen Sie Ihre JSON-Datei hierher',
      clickToBrowse: 'oder klicken Sie zum Durchsuchen',
      info: 'Die Datei sollte eine gültige JSON-Datei sein, die aus MUCGPT exportiert wurde und die Konfiguration des Assistenten enthält. Er wird Ihrem persönlichen Bereich hinzugefügt.',
      cancel: 'Abbrechen',
    },
  },
  // Placeholders for other languages
  es: {} as any,
  fr: {} as any,
  it: {} as any,
  pt: {} as any,
};

type TranslationKey = keyof typeof translations.en;

// Copy English translations as fallback for unimplemented languages
translations.es = { ...translations.en };
translations.fr = { ...translations.en };
translations.it = { ...translations.en };
translations.pt = { ...translations.en };

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
};

export const getLanguage = (): Language => {
  const saved = localStorage.getItem('language');
  return (saved as Language) || 'en';
};

export const t = (key: TranslationKey, lang?: Language): string => {
  const targetLang = lang || currentLanguage;
  // This is a simplified deep access for the import_assistant block
  // For other nested keys, a more robust deep access function would be needed.
  if (typeof translations[targetLang][key] === 'object' && translations[targetLang][key] !== null) {
    // This case should ideally not happen if TranslationKey is only for top-level keys
    // and t() is only called with top-level keys.
    // If t() is expected to handle nested keys like t('import_assistant.title'),
    // then the TranslationKey type and t function logic need to be more complex.
    // For now, assuming key is a direct string for a string value.
    return translations.en[key] as string || key;
  }
  return (translations[targetLang][key] as string) || (translations.en[key] as string) || key;
};

export const getWelcomeMessages = (lang?: Language) => {
  const targetLang = lang || currentLanguage;
  return translations[targetLang].welcomeMessages;
};

// Initialize language from localStorage
if (typeof window !== 'undefined') {
  currentLanguage = getLanguage();
}
