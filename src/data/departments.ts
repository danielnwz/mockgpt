import { Department } from '../types';

export const departments: Department[] = [
  {
    id: 'rit',
    name: 'IT-Referat (RIT)',
    children: [
      {
        id: 'rit-strat',
        name: 'IT-Strategie & Governance',
        children: [
          { id: 'rit-strat-arch', name: 'Enterprise Architecture' },
          { id: 'rit-strat-sec', name: 'Information Security (CISO)' },
          { id: 'rit-strat-portfolio', name: 'IT-Portfolio Management' },
        ],
      },
      {
        id: 'rit-infra',
        name: 'IT-Infrastruktur',
        children: [
          {
            id: 'rit-infra-dc',
            name: 'Rechenzentrumsbetrieb',
            children: [
              { id: 'rit-infra-dc-ops', name: 'Server Operations' },
              { id: 'rit-infra-dc-net', name: 'Network Engineering' },
            ],
          },
          {
            id: 'rit-infra-workplace',
            name: 'Digital Workplace',
            children: [
              { id: 'rit-infra-wp-clients', name: 'Client Management' },
              { id: 'rit-infra-wp-collab', name: 'Collaboration Tools' },
            ],
          },
        ],
      },
      {
        id: 'rit-apps',
        name: 'Anwendungen & Verfahren',
        children: [
          { id: 'rit-apps-citizen', name: 'Bürgerservices (Online)' },
          { id: 'rit-apps-internal', name: 'Interne Verwaltungsprozesse' },
          { id: 'rit-apps-sap', name: 'SAP Competence Center' },
        ],
      },
      {
        id: 'rit-data',
        name: 'Data & AI',
        children: [
          { id: 'rit-data-lake', name: 'Municipal Data Lake' },
          { id: 'rit-data-ai', name: 'AI Competence Center' },
        ],
      },
    ],
  },
  {
    id: 'kvr',
    name: 'Kreisverwaltungsreferat (KVR)',
    children: [
      {
        id: 'kvr-ha2',
        name: 'HA II - Einwohnerwesen',
        children: [
          {
            id: 'kvr-buerger',
            name: 'Bürgerbüro',
            children: [
              { id: 'kvr-buerger-pass', name: 'Pass- und Ausweiswesen' },
              { id: 'kvr-buerger-melde', name: 'Meldeangelegenheiten' },
            ],
          },
          {
            id: 'kvr-auslaender',
            name: 'Ausländerangelegenheiten',
            children: [
              { id: 'kvr-auslaender-aufenthalt', name: 'Aufenthaltserlaubnis' },
              { id: 'kvr-auslaender-studenten', name: 'Studierende & Fachkräfte' },
            ],
          },
        ],
      },
      {
        id: 'kvr-ha3',
        name: 'HA III - Straßenverkehr',
        children: [
          {
            id: 'kvr-kfz',
            name: 'Kraftfahrzeugzulassung',
            children: [
              { id: 'kvr-kfz-privat', name: 'Privatkunden' },
              { id: 'kvr-kfz-gewerbe', name: 'Gewerbekunden/Händler' },
            ],
          },
          {
            id: 'kvr-fuehrer',
            name: 'Fahrerlaubnisbehörde',
          },
        ],
      },
      {
        id: 'kvr-ha1',
        name: 'HA I - Sicherheit & Ordnung',
        children: [
          { id: 'kvr-ha1-veranst', name: 'Veranstaltungs- und Versammlungsbüro' },
          { id: 'kvr-ha1-gewerbe', name: 'Gewerbebehörde' },
        ],
      },
    ],
  },
  {
    id: 'rbs',
    name: 'Ref. für Bildung und Sport (RBS)',
    children: [
      {
        id: 'rbs-schools',
        name: 'Allgemeinbildende Schulen',
        children: [
          { id: 'rbs-gs', name: 'Grundschulen' },
          { id: 'rbs-ms', name: 'Mittelschulen' },
          { id: 'rbs-gym', name: 'Gymnasien' },
        ],
      },
      {
        id: 'rbs-kita',
        name: 'Kindertageseinrichtungen',
        children: [
          { id: 'rbs-kita-admin', name: 'Verwaltung & Gebühren' },
          { id: 'rbs-kita-paed', name: 'Pädagogische Leitung' },
        ],
      },
      {
        id: 'rbs-sport',
        name: 'Sportamt',
        children: [
          { id: 'rbs-sport-infra', name: 'Sportstättenbau' },
          { id: 'rbs-sport-events', name: 'Sportveranstaltungen' },
        ],
      },
    ],
  },
  {
    id: 'plan',
    name: 'Stadtplanung und Bauordnung',
    children: [
      {
        id: 'plan-stadt',
        name: 'Stadtplanung',
        children: [
          { id: 'plan-stadt-fnp', name: 'Flächennutzungsplanung' },
          { id: 'plan-stadt-beb', name: 'Verbindliche Bauleitplanung' },
        ],
      },
      {
        id: 'plan-lokal',
        name: 'Lokalbaukommission',
        children: [
          { id: 'plan-lokal-genehm', name: 'Baugenehmigungsverfahren' },
          { id: 'plan-lokal-berat', name: 'Bauberatung' },
        ],
      },
    ],
  },
  {
    id: 'soz',
    name: 'Sozialreferat',
    children: [
      {
        id: 'soz-jugend',
        name: 'Stadtjugendamt',
        children: [
          { id: 'soz-jugend-fam', name: 'Familienhilfe' },
          { id: 'soz-jugend-schutz', name: 'Kinderschutz' },
        ],
      },
      {
        id: 'soz-wohn',
        name: 'Amt für Wohnen und Migration',
        children: [
          { id: 'soz-wohn-social', name: 'Sozialwohnungen' },
          { id: 'soz-wohn-geld', name: 'Wohngeldstelle' },
        ],
      },
    ],
  },
  {
    id: 'mob',
    name: 'Mobilitätsreferat',
    children: [
      {
        id: 'mob-strat',
        name: 'Verkehrsstrategie',
        children: [
          { id: 'mob-strat-rad', name: 'Radverkehr' },
          { id: 'mob-strat-oepnv', name: 'ÖPNV-Koordination' },
        ],
      },
      {
        id: 'mob-mgmt',
        name: 'Verkehrsmanagement',
        children: [
          { id: 'mob-mgmt-licht', name: 'Lichtsignalanlagen (Ampeln)' },
          { id: 'mob-mgmt-bau', name: 'Baustellenkoordination' },
        ],
      },
    ],
  },
];
