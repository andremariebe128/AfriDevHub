import type { Locale } from '@/lib/i18n';

/**
 * Textes juridiques (confidentialité, conditions, mentions légales).
 * Les champs OPERATOR sont à compléter par l'éditeur avant la mise en production.
 */
export const OPERATOR = {
  name: process.env.NEXT_PUBLIC_LEGAL_NAME ?? '[Nom de l’éditeur à compléter]',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '',
  emailFallback: '[adresse e-mail de contact à compléter]',
  updated: { fr: '5 octobre 2026', en: 'October 5, 2026' },
};

/** Un bloc est un paragraphe (string) ou une liste à puces (string[]). {email} devient un lien. */
type Block = string | string[];
export type Section = { id: string; h: string; body: Block[] };
export type LegalDoc = { slug: 'confidentialite' | 'conditions' | 'mentions-legales'; title: string; intro: string; sections: Section[] };

const FR: Record<LegalDoc['slug'], LegalDoc> = {
  confidentialite: {
    slug: 'confidentialite',
    title: 'Politique de confidentialité',
    intro:
      'AfriDevHub est une plateforme d’échange pour les développeurs africains. Cette page explique quelles données personnelles nous traitons, pourquoi, combien de temps, et comment exercer vos droits. Elle est rédigée en application de la loi n° 2017-20 du 20 avril 2018 portant Code du numérique en République du Bénin (livre consacré à la protection des données à caractère personnel).',
    sections: [
      {
        id: 'responsable',
        h: 'Qui est responsable de vos données ?',
        body: [
          'Le responsable du traitement est l’éditeur d’AfriDevHub : {name}. Pour toute question sur vos données, écrivez-nous à {email}.',
        ],
      },
      {
        id: 'donnees',
        h: 'Quelles données collectons-nous ?',
        body: [
          'Nous ne collectons que ce qui est nécessaire au fonctionnement du service :',
          [
            'Compte : adresse e-mail, mot de passe (jamais stocké en clair, il est géré par le service d’authentification) et pseudo.',
            'Profil, facultatif : nom, pays, titre, présentation, technologies, langues parlées, années d’expérience, liens GitHub et site web, disponibilités (mentorat, collaboration, mission).',
            'Contributions : questions, réponses, votes, projets partagés, notes attribuées aux projets, opportunités et annonces de mentorat que vous publiez.',
            'Données techniques : adresse IP et journaux de connexion traités par nos prestataires d’hébergement pour assurer la sécurité et le bon fonctionnement du service.',
          ],
          'Nous n’utilisons ni outil de mesure d’audience, ni publicité, ni traceur de tiers. Nous ne demandons aucune donnée sensible (origine, opinions, santé, etc.) et nous vous demandons de ne pas en publier.',
        ],
      },
      {
        id: 'public',
        h: 'Ce qui est public, ce qui reste privé',
        body: [
          [
            'Public : votre pseudo, votre profil et tout ce que vous publiez (questions, réponses, projets, annonces) sont visibles par tous, y compris des moteurs de recherche.',
            'Privé : votre adresse e-mail et votre mot de passe ne sont jamais affichés. Vos votes sur les réponses ne sont visibles que par vous ; seul le score qui en résulte est public.',
          ],
          'Ne publiez pas d’informations que vous ne souhaitez pas rendre publiques (numéro de téléphone, clés d’accès, mots de passe, données de clients).',
        ],
      },
      {
        id: 'finalites',
        h: 'Pourquoi traitons-nous ces données ?',
        body: [
          [
            'Fournir le service : créer et sécuriser votre compte, publier et afficher vos contributions, calculer les scores et la réputation (exécution des conditions d’utilisation).',
            'Assurer la sécurité et prévenir les abus : lutte contre le spam, la fraude et les contenus illicites (intérêt légitime de l’éditeur).',
            'Améliorer le service à partir de retours volontaires que vous nous envoyez (intérêt légitime).',
            'Respecter nos obligations légales et répondre aux demandes des autorités compétentes.',
          ],
          'Nous ne vendons pas vos données et ne les utilisons pas pour du profilage publicitaire.',
        ],
      },
      {
        id: 'conservation',
        h: 'Combien de temps les conservons-nous ?',
        body: [
          [
            'Compte et profil : tant que votre compte est actif. À sa suppression, votre profil et vos contributions sont supprimés.',
            'Journaux techniques : conservés par nos prestataires pour une durée limitée, nécessaire à la sécurité.',
            'Sauvegardes : les données supprimées peuvent subsister dans des sauvegardes pendant un délai limité avant effacement définitif.',
          ],
        ],
      },
      {
        id: 'destinataires',
        h: 'Qui reçoit vos données ?',
        body: [
          'Vos données sont accessibles à l’équipe d’AfriDevHub dans la limite de ses missions, et à nos prestataires techniques, qui agissent sur nos instructions :',
          [
            'Supabase : base de données et authentification.',
            'Vercel : hébergement et diffusion du site.',
          ],
          'Elles peuvent être communiquées à une autorité si la loi l’exige. Aucune autre communication n’est faite sans votre accord.',
        ],
      },
      {
        id: 'transferts',
        h: 'Transferts hors du Bénin',
        body: [
          'Nos prestataires peuvent héberger ou traiter des données en dehors du Bénin et de l’Afrique. Dans ce cas, nous veillons à ce que ces transferts soient encadrés par des garanties contractuelles et techniques appropriées, conformément au Code du numérique.',
        ],
      },
      {
        id: 'cookies',
        h: 'Cookies et stockage local',
        body: [
          'AfriDevHub dépose uniquement des éléments strictement nécessaires au service ou que vous demandez expressément. Ils ne servent ni au suivi ni à la publicité, et ne requièrent donc pas de bandeau de consentement :',
          [
            'Session de connexion (stockage local du navigateur, géré par Supabase) : vous garder connecté·e. Supprimée à la déconnexion.',
            'adh-lang (cookie, 1 an) : mémoriser votre langue (français ou anglais).',
            'adh-theme (stockage local) : mémoriser votre thème clair, sombre ou système.',
            'adh-lite (stockage local) : mémoriser le mode « Éco data ».',
            'Cache hors ligne (service worker) : afficher la page hors ligne et accélérer le chargement des fichiers statiques.',
          ],
          'Vous pouvez effacer ces éléments à tout moment depuis les réglages de votre navigateur ; certaines fonctions (connexion, préférences) cesseront alors de fonctionner.',
        ],
      },
      {
        id: 'securite',
        h: 'Sécurité',
        body: [
          'Nous protégeons vos données par des mesures techniques et organisationnelles : connexion chiffrée (HTTPS), mots de passe protégés par le service d’authentification, règles d’accès à la base limitant chaque utilisateur à ses propres données modifiables, accès restreint de l’équipe. Aucun système n’est infaillible. En cas de violation de données, nous informerons l’autorité compétente et les personnes concernées dans les conditions prévues par la loi.',
        ],
      },
      {
        id: 'droits',
        h: 'Vos droits',
        body: [
          'Conformément au Code du numérique, vous disposez des droits suivants sur vos données :',
          [
            'Accès : savoir quelles données nous détenons et en obtenir une copie.',
            'Rectification : corriger des données inexactes. Vous pouvez modifier la plupart des informations depuis la page « Mon profil ».',
            'Opposition : vous opposer à un traitement pour un motif légitime.',
            'Suppression : demander l’effacement de vos données et de votre compte.',
            'Limitation et portabilité, lorsque la loi le prévoit.',
            'Retrait de votre consentement, à tout moment, lorsque le traitement repose sur celui-ci.',
          ],
          'Pour exercer ces droits, écrivez à {email} depuis l’adresse liée à votre compte. Nous pouvons vous demander de prouver votre identité, et nous répondons dans les meilleurs délais.',
        ],
      },
      {
        id: 'mineurs',
        h: 'Mineurs',
        body: [
          'Le service est destiné à des personnes en capacité de s’engager. Les mineurs doivent obtenir l’accord de leur représentant légal avant de créer un compte. Si vous pensez qu’un mineur nous a transmis des données sans cet accord, contactez-nous pour les faire supprimer.',
        ],
      },
      {
        id: 'reclamation',
        h: 'Réclamation',
        body: [
          'Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir l’Autorité de protection des données personnelles (APDP) du Bénin, ou l’autorité de protection des données de votre pays de résidence.',
        ],
      },
      {
        id: 'modifications',
        h: 'Modifications de cette politique',
        body: [
          'Nous pouvons mettre à jour cette politique, par exemple si le service ou la loi évolue. La date de dernière mise à jour figure en haut de la page ; en cas de changement important, nous vous en informerons sur le site.',
        ],
      },
    ],
  },

  conditions: {
    slug: 'conditions',
    title: 'Conditions générales d’utilisation',
    intro:
      'En créant un compte ou en utilisant AfriDevHub, vous acceptez les présentes conditions. Elles posent des règles simples pour que la communauté reste utile, respectueuse et sûre.',
    sections: [
      {
        id: 'objet',
        h: 'Objet du service',
        body: [
          'AfriDevHub est une plateforme gratuite d’échange entre développeurs : questions et réponses, partage de projets, espaces par pays et technologie, opportunités et mise en relation avec des mentors. Elle est éditée par {name}.',
        ],
      },
      {
        id: 'compte',
        h: 'Votre compte',
        body: [
          [
            'Vous fournissez des informations exactes et vous gardez votre mot de passe confidentiel.',
            'Vous êtes responsable de l’activité réalisée depuis votre compte.',
            'Un compte est personnel. Les comptes créés automatiquement ou en masse sont interdits.',
          ],
        ],
      },
      {
        id: 'regles',
        h: 'Règles de la communauté',
        body: [
          'Vous vous engagez à ne pas publier de contenu :',
          [
            'illicite, discriminatoire, haineux, harcelant, menaçant ou diffamatoire ;',
            'contraire à la vie privée d’autrui (données personnelles, conversations privées publiées sans accord) ;',
            'qui porte atteinte à des droits de propriété intellectuelle, ou qui contient du code malveillant ;',
            'de nature commerciale non sollicitée, trompeur, frauduleux ou répétitif (spam) ;',
            'qui contient des clés d’accès, mots de passe ou données de clients.',
          ],
          'Soyez courtois·e, citez vos sources et acceptez que vos questions et réponses soient améliorées par la communauté.',
        ],
      },
      {
        id: 'contenus',
        h: 'Vos contenus',
        body: [
          'Vous restez propriétaire de ce que vous publiez. En le publiant, vous accordez à AfriDevHub une licence non exclusive, gratuite et mondiale pour l’héberger, l’afficher, le reproduire techniquement et le rendre accessible au public (y compris aux moteurs de recherche) dans le cadre du service, pour la durée de sa publication.',
          'Vous garantissez avoir le droit de publier ces contenus. Les extraits de code et réponses sont partagés pour aider les autres : indiquez la licence applicable si vous reprenez un code qui n’est pas le vôtre.',
        ],
      },
      {
        id: 'moderation',
        h: 'Modération',
        body: [
          'Nous pouvons retirer un contenu ou suspendre un compte qui ne respecte pas ces conditions, ou si la loi l’exige, avec ou sans préavis selon la gravité. Pour signaler un contenu, écrivez à {email} en indiquant le lien de la page concernée.',
        ],
      },
      {
        id: 'ressources',
        h: 'Réponses, projets et opportunités',
        body: [
          [
            'Les réponses viennent de membres de la communauté et ne sont pas vérifiées : testez avant de mettre en production et ne les considérez pas comme un conseil professionnel, juridique ou financier.',
            'Les opportunités, missions et annonces de mentorat sont publiées par des tiers. Vérifiez leur sérieux avant de communiquer des informations ou d’engager de l’argent. AfriDevHub n’est pas partie aux accords conclus entre membres.',
          ],
        ],
      },
      {
        id: 'propriete',
        h: 'Propriété intellectuelle',
        body: [
          'Le nom, le logo, l’interface et le code d’AfriDevHub sont protégés. Vous ne pouvez pas les reproduire ou les réutiliser sans accord écrit, hors usage normal du service. Les bibliothèques tierces utilisées restent soumises à leurs propres licences.',
        ],
      },
      {
        id: 'disponibilite',
        h: 'Disponibilité et responsabilité',
        body: [
          'Le service est fourni « en l’état », sans garantie de disponibilité continue : des interruptions peuvent survenir (maintenance, panne, coupure réseau). Dans la limite permise par la loi, l’éditeur n’est pas responsable des dommages indirects, de la perte de données ou des contenus publiés par les membres. Ces limites ne s’appliquent pas aux cas où la loi interdit de les prévoir.',
        ],
      },
      {
        id: 'donnees',
        h: 'Données personnelles',
        body: ['Le traitement de vos données est décrit dans la politique de confidentialité, qui fait partie des présentes conditions.'],
      },
      {
        id: 'fin',
        h: 'Fin du compte',
        body: [
          'Vous pouvez demander la suppression de votre compte à tout moment en écrivant à {email}. Nous pouvons résilier ou suspendre un compte en cas de manquement grave ou répété.',
        ],
      },
      {
        id: 'droit',
        h: 'Droit applicable et litiges',
        body: [
          'Les présentes conditions sont régies par le droit béninois. En cas de différend, une solution amiable est recherchée en priorité ; à défaut, les juridictions béninoises compétentes seront saisies, sans préjudice des droits dont vous disposez en tant que consommateur dans votre pays.',
        ],
      },
      {
        id: 'evolution',
        h: 'Évolution des conditions',
        body: ['Nous pouvons modifier ces conditions. La date de mise à jour figure en haut de la page ; continuer à utiliser le service après une modification vaut acceptation.'],
      },
    ],
  },

  'mentions-legales': {
    slug: 'mentions-legales',
    title: 'Mentions légales',
    intro: 'Informations légales relatives au site AfriDevHub, conformément aux obligations d’identification des éditeurs de services en ligne.',
    sections: [
      {
        id: 'editeur',
        h: 'Éditeur du site',
        body: [['Dénomination : {name}', 'Contact : {email}']],
      },
      {
        id: 'publication',
        h: 'Directeur de la publication',
        body: ['Le directeur de la publication est le représentant légal de l’éditeur, joignable à {email}.'],
      },
      {
        id: 'hebergement',
        h: 'Hébergement et services techniques',
        body: [
          [
            'Hébergement et diffusion du site : Vercel Inc. (vercel.com).',
            'Base de données et authentification : Supabase (supabase.com).',
          ],
        ],
      },
      {
        id: 'propriete',
        h: 'Propriété intellectuelle',
        body: [
          'La structure, le design, les textes et le code d’AfriDevHub sont protégés. Les contenus publiés par les membres restent leur propriété, selon les conditions d’utilisation.',
        ],
      },
      {
        id: 'credits',
        h: 'Crédits',
        body: [
          [
            'Icônes : Lucide (licence ISC).',
            'Drapeaux : country-flag-icons (licence MIT).',
            'Polices : Bricolage Grotesque, Instrument Sans et JetBrains Mono (licence SIL Open Font).',
          ],
        ],
      },
      {
        id: 'donnees',
        h: 'Données personnelles',
        body: ['Le traitement des données personnelles est décrit dans la politique de confidentialité. Vous pouvez exercer vos droits en écrivant à {email}.'],
      },
      {
        id: 'signalement',
        h: 'Signaler un contenu illicite',
        body: ['Pour signaler un contenu manifestement illicite, écrivez à {email} en indiquant l’adresse de la page et le motif. Nous l’examinerons dans les meilleurs délais.'],
      },
    ],
  },
};

const EN: Record<LegalDoc['slug'], LegalDoc> = {
  confidentialite: {
    slug: 'confidentialite',
    title: 'Privacy policy',
    intro:
      'AfriDevHub is an exchange platform for African developers. This page explains which personal data we process, why, for how long, and how to exercise your rights. It is written under Law No. 2017-20 of 20 April 2018 on the Digital Code of the Republic of Benin (book on the protection of personal data).',
    sections: [
      {
        id: 'responsable',
        h: 'Who is responsible for your data?',
        body: ['The data controller is the publisher of AfriDevHub: {name}. For any question about your data, write to {email}.'],
      },
      {
        id: 'donnees',
        h: 'What data do we collect?',
        body: [
          'We only collect what is needed to run the service:',
          [
            'Account: email address, password (never stored in clear text, it is handled by the authentication service) and username.',
            'Profile, optional: name, country, headline, bio, technologies, spoken languages, years of experience, GitHub and website links, availability (mentoring, collaboration, work).',
            'Contributions: questions, answers, votes, shared projects, project ratings, opportunities and mentoring listings you publish.',
            'Technical data: IP address and connection logs processed by our hosting providers to keep the service secure and running.',
          ],
          'We use no audience-measurement tool, no advertising and no third-party tracker. We do not ask for sensitive data (origin, opinions, health, etc.) and ask you not to publish any.',
        ],
      },
      {
        id: 'public',
        h: 'What is public, what stays private',
        body: [
          [
            'Public: your username, your profile and everything you publish (questions, answers, projects, listings) are visible to everyone, including search engines.',
            'Private: your email address and password are never displayed. Your votes on answers are visible only to you; only the resulting score is public.',
          ],
          'Do not publish information you do not want to make public (phone number, access keys, passwords, customer data).',
        ],
      },
      {
        id: 'finalites',
        h: 'Why do we process this data?',
        body: [
          [
            'Provide the service: create and secure your account, publish and display your contributions, compute scores and reputation (performance of the terms of use).',
            'Ensure security and prevent abuse: fighting spam, fraud and unlawful content (legitimate interest of the publisher).',
            'Improve the service using the feedback you voluntarily send us (legitimate interest).',
            'Comply with our legal obligations and answer requests from competent authorities.',
          ],
          'We do not sell your data and do not use it for advertising profiling.',
        ],
      },
      {
        id: 'conservation',
        h: 'How long do we keep it?',
        body: [
          [
            'Account and profile: as long as your account is active. When it is deleted, your profile and contributions are deleted.',
            'Technical logs: kept by our providers for a limited period needed for security.',
            'Backups: deleted data may remain in backups for a limited time before final erasure.',
          ],
        ],
      },
      {
        id: 'destinataires',
        h: 'Who receives your data?',
        body: [
          'Your data is accessible to the AfriDevHub team within the limits of its duties, and to our technical providers, who act on our instructions:',
          ['Supabase: database and authentication.', 'Vercel: hosting and delivery of the site.'],
          'It may be disclosed to an authority if the law requires it. No other disclosure is made without your consent.',
        ],
      },
      {
        id: 'transferts',
        h: 'Transfers outside Benin',
        body: [
          'Our providers may host or process data outside Benin and Africa. In that case we make sure such transfers are covered by appropriate contractual and technical safeguards, in line with the Digital Code.',
        ],
      },
      {
        id: 'cookies',
        h: 'Cookies and local storage',
        body: [
          'AfriDevHub only stores items strictly necessary to the service or that you explicitly request. They are not used for tracking or advertising, so no consent banner is required:',
          [
            'Login session (browser local storage, managed by Supabase): keeps you signed in. Removed when you sign out.',
            'adh-lang (cookie, 1 year): remembers your language (French or English).',
            'adh-theme (local storage): remembers your light, dark or system theme.',
            'adh-lite (local storage): remembers the “Data saver” mode.',
            'Offline cache (service worker): shows the offline page and speeds up loading of static files.',
          ],
          'You can clear these items at any time from your browser settings; some features (login, preferences) will then stop working.',
        ],
      },
      {
        id: 'securite',
        h: 'Security',
        body: [
          'We protect your data with technical and organisational measures: encrypted connection (HTTPS), passwords protected by the authentication service, database access rules limiting each user to their own editable data, restricted team access. No system is infallible. In case of a data breach, we will inform the competent authority and the people concerned as required by law.',
        ],
      },
      {
        id: 'droits',
        h: 'Your rights',
        body: [
          'Under the Digital Code, you have the following rights over your data:',
          [
            'Access: know which data we hold and get a copy.',
            'Rectification: correct inaccurate data. You can edit most information from the “My profile” page.',
            'Objection: object to processing on legitimate grounds.',
            'Erasure: ask for your data and account to be deleted.',
            'Restriction and portability, where the law provides for them.',
            'Withdrawal of consent at any time, where processing is based on it.',
          ],
          'To exercise these rights, write to {email} from the address linked to your account. We may ask you to prove your identity, and we reply as soon as possible.',
        ],
      },
      {
        id: 'mineurs',
        h: 'Minors',
        body: [
          'The service is intended for people able to enter into a commitment. Minors must obtain their legal representative’s consent before creating an account. If you believe a minor gave us data without it, contact us to have it deleted.',
        ],
      },
      {
        id: 'reclamation',
        h: 'Complaints',
        body: [
          'If you believe your rights are not respected, you can contact the Personal Data Protection Authority (APDP) of Benin, or the data protection authority of your country of residence.',
        ],
      },
      {
        id: 'modifications',
        h: 'Changes to this policy',
        body: [
          'We may update this policy, for example if the service or the law changes. The date of the last update is shown at the top of the page; for any major change, we will let you know on the site.',
        ],
      },
    ],
  },

  conditions: {
    slug: 'conditions',
    title: 'Terms of use',
    intro:
      'By creating an account or using AfriDevHub, you accept these terms. They set simple rules so the community stays useful, respectful and safe.',
    sections: [
      {
        id: 'objet',
        h: 'Purpose of the service',
        body: [
          'AfriDevHub is a free exchange platform for developers: questions and answers, project sharing, spaces by country and technology, opportunities and connections with mentors. It is published by {name}.',
        ],
      },
      {
        id: 'compte',
        h: 'Your account',
        body: [
          [
            'You provide accurate information and keep your password confidential.',
            'You are responsible for the activity carried out from your account.',
            'An account is personal. Accounts created automatically or in bulk are forbidden.',
          ],
        ],
      },
      {
        id: 'regles',
        h: 'Community rules',
        body: [
          'You agree not to publish content that is:',
          [
            'unlawful, discriminatory, hateful, harassing, threatening or defamatory;',
            'contrary to others’ privacy (personal data, private conversations published without consent);',
            'infringing intellectual property rights, or containing malicious code;',
            'unsolicited commercial, misleading, fraudulent or repetitive (spam);',
            'containing access keys, passwords or customer data.',
          ],
          'Be courteous, cite your sources and accept that your questions and answers may be improved by the community.',
        ],
      },
      {
        id: 'contenus',
        h: 'Your content',
        body: [
          'You remain the owner of what you publish. By publishing it, you grant AfriDevHub a non-exclusive, free, worldwide licence to host, display, technically reproduce and make it publicly accessible (including to search engines) as part of the service, for as long as it is published.',
          'You warrant that you have the right to publish it. Code snippets and answers are shared to help others: state the applicable licence if you reuse code that is not yours.',
        ],
      },
      {
        id: 'moderation',
        h: 'Moderation',
        body: [
          'We may remove content or suspend an account that does not comply with these terms, or if the law requires it, with or without notice depending on severity. To report content, write to {email} with the link of the page concerned.',
        ],
      },
      {
        id: 'ressources',
        h: 'Answers, projects and opportunities',
        body: [
          [
            'Answers come from community members and are not verified: test before going to production and do not treat them as professional, legal or financial advice.',
            'Opportunities, missions and mentoring listings are published by third parties. Check that they are genuine before sharing information or committing money. AfriDevHub is not a party to agreements between members.',
          ],
        ],
      },
      {
        id: 'propriete',
        h: 'Intellectual property',
        body: [
          'The name, logo, interface and code of AfriDevHub are protected. You may not reproduce or reuse them without written consent, beyond normal use of the service. Third-party libraries remain subject to their own licences.',
        ],
      },
      {
        id: 'disponibilite',
        h: 'Availability and liability',
        body: [
          'The service is provided “as is”, with no guarantee of continuous availability: interruptions may occur (maintenance, outage, network loss). To the extent permitted by law, the publisher is not liable for indirect damage, data loss or content published by members. These limits do not apply where the law forbids them.',
        ],
      },
      {
        id: 'donnees',
        h: 'Personal data',
        body: ['The processing of your data is described in the privacy policy, which forms part of these terms.'],
      },
      {
        id: 'fin',
        h: 'Ending your account',
        body: [
          'You can ask for your account to be deleted at any time by writing to {email}. We may terminate or suspend an account in case of serious or repeated breach.',
        ],
      },
      {
        id: 'droit',
        h: 'Governing law and disputes',
        body: [
          'These terms are governed by Beninese law. In case of dispute, an amicable solution is sought first; failing that, the competent Beninese courts will hear the case, without prejudice to the rights you have as a consumer in your country.',
        ],
      },
      {
        id: 'evolution',
        h: 'Changes to the terms',
        body: ['We may change these terms. The update date is shown at the top of the page; continuing to use the service after a change means you accept it.'],
      },
    ],
  },

  'mentions-legales': {
    slug: 'mentions-legales',
    title: 'Legal notice',
    intro: 'Legal information about the AfriDevHub site, in line with the identification duties of online service publishers.',
    sections: [
      { id: 'editeur', h: 'Site publisher', body: [['Name: {name}', 'Contact: {email}']] },
      {
        id: 'publication',
        h: 'Publication director',
        body: ['The publication director is the legal representative of the publisher, reachable at {email}.'],
      },
      {
        id: 'hebergement',
        h: 'Hosting and technical services',
        body: [['Site hosting and delivery: Vercel Inc. (vercel.com).', 'Database and authentication: Supabase (supabase.com).']],
      },
      {
        id: 'propriete',
        h: 'Intellectual property',
        body: [
          'The structure, design, texts and code of AfriDevHub are protected. Content published by members remains theirs, under the terms of use.',
        ],
      },
      {
        id: 'credits',
        h: 'Credits',
        body: [
          [
            'Icons: Lucide (ISC licence).',
            'Flags: country-flag-icons (MIT licence).',
            'Fonts: Bricolage Grotesque, Instrument Sans and JetBrains Mono (SIL Open Font licence).',
          ],
        ],
      },
      {
        id: 'donnees',
        h: 'Personal data',
        body: ['The processing of personal data is described in the privacy policy. You can exercise your rights by writing to {email}.'],
      },
      {
        id: 'signalement',
        h: 'Reporting unlawful content',
        body: ['To report manifestly unlawful content, write to {email} with the page address and the reason. We will review it as soon as possible.'],
      },
    ],
  },
};

export const LEGAL_SLUGS = ['confidentialite', 'conditions', 'mentions-legales'] as const;

export function getLegalDoc(slug: LegalDoc['slug'], locale: Locale): LegalDoc {
  return (locale === 'en' ? EN : FR)[slug];
}
