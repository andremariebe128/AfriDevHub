-- =====================================================
-- AfriDevHub - Données réelles (seed) - sans apostrophes
-- À exécuter dans Supabase > SQL Editor
-- Comptes :
--   aicha_dev   = 9a087d3e-c789-4eaa-a1a7-afa0a243222f
--   Andre-Marie = 260cf30d-4254-4320-8330-55b849038283
-- =====================================================

-- ---------- 1. Profils enrichis ----------
update public.profiles set
  country = 'Sénégal',
  bio = 'Développeuse full-stack à Dakar. Laravel, Livewire et paiements Mobile Money.',
  stack = array['php','laravel','javascript','mysql'],
  github_url = 'https://github.com/aicha-dev'
where username = 'aicha_dev';

update public.profiles set
  country = 'Bénin',
  bio = 'Développeur web et mobile. Laravel, Flutter, API de paiement.',
  stack = array['php','laravel','flutter','supabase']
where username = 'Andre-Marie';

-- ---------- 2. Questions de aicha_dev ----------
insert into public.questions (author_id, title, body, tags) values
('9a087d3e-c789-4eaa-a1a7-afa0a243222f',
 'Mon webhook Wave est appelé deux fois de suite : comment éviter les doublons de paiement ?',
 E'Je viens d\'intégrer l\'API Wave pour accepter les paiements sur mon site Laravel. Le problème : quand un client paie, Wave envoie le webhook deux fois en l\'espace de 2 secondes (retentative après timeout). Résultat : mon système crédite deux fois le compte client.\n\nVoici mon handler actuel :\n\n```php\npublic function handleWebhook(Request $request)\n{\n    $payload = $request->json()->all();\n    $order = Order::where("reference", $payload["data"]["reference"])->first();\n    $order->markAsPaid();\n}\n```\n\nComment vous gérez l\'idempotence chez vous ? J\'ai pensé à une table de transactions avec une contrainte unique sur la référence Wave, mais je ne sais pas si c\'est la bonne approche.',
 array['php','laravel','mobile-money','api']),

('9a087d3e-c789-4eaa-a1a7-afa0a243222f',
 'Laravel + Vue ou Laravel + Livewire pour un projet avec équipe de 3 devs ?',
 E'On démarre une plateforme de gestion de stock pour une entreprise à Dakar. Sommes 3 devs (2 juniors, 1 confirmé). Le projet doit être livré en 4 mois.\n\nJe connais bien Vue mais j\'hésite à introduire un deuxième framework dans l\'équipe. Livewire semble plus simple pour les juniors mais j\'ai peur des limitations côté UI complexe (tableaux dynamiques, drag & drop).\n\nQu\'est-ce que vous recommandez dans ce contexte ?',
 array['php','laravel','livewire','vue','architecture']),

('9a087d3e-c789-4eaa-a1a7-afa0a243222f',
 'Comment tester une API Mobile Money hors connexion (en 2G instable) ?',
 E'Je développe une PWA qui doit fonctionner même avec une connexion très faible. Les tests locaux ne reflètent pas la réalité : sur le terrain, les requêtes prennent 10-15 secondes ou échouent carrément.\n\nComment simuler ces conditions dans mes tests ? J\'ai vu des outils comme Chrome DevTools throttling mais ça ne suffit pas pour tester les timeouts, les retry et le cache local.',
 array['pwa','mobile-money','testing','offline']),

('9a087d3e-c789-4eaa-a1a7-afa0a243222f',
 'Quelle stratégie de pricing pour un SaaS destiné aux PME africaines ?',
 E'Je lance un outil de facturation en ligne pour les petites entreprises au Sénégal et en Côte d\'Ivoire. Le marché est sensible au prix. Le XOF n\'est pas accepté par Stripe.\n\nComment fixer un prix viable ? Faut-il facturer en XOF, en EUR, ou via Mobile Money ? Vous avez des retours d\'expérience sur ce sujet ?',
 array['saas','business','mobile-money','pricing']);

-- ---------- 3. Réponses d'Andre-Marie ----------
insert into public.answers (question_id, author_id, body, score)
select q.id,
       '260cf30d-4254-4320-8330-55b849038283',
       E'La contrainte unique sur la référence Wave est exactement la bonne approche. Voici ce que je fais chez nous :\n\n```php\npublic function handleWebhook(Request $request)\n{\n    $reference = $request->json()->get("data.reference");\n\n    $txn = DB::transaction(function () use ($reference, $request) {\n        $txn = PaymentTransaction::updateOrCreate(\n            ["wave_reference" => $reference],\n            ["status" => "completed", "payload" => $request->json()->all(), "paid_at" => now()]\n        );\n        return $txn;\n    });\n\n    if ($txn->wasRecentlyCreated) {\n        $txn->order->markAsPaid();\n    }\n\n    return response()->json(["status" => "ok"]);\n}\n```\n\nL\'astuce c\'est le updateOrCreate + la contrainte unique : si le webhook arrive deux fois, le deuxième insert échoue et on ne crédite qu\'une fois. Pense aussi à vérifier la signature HMAC de Wave pour éviter les faux webhooks.',
       8
from public.questions q
where q.title LIKE '%webhook Wave%';

insert into public.answers (question_id, author_id, body, score)
select q.id,
       '260cf30d-4254-4320-8330-55b849038283',
       E'Pour une équipe avec des juniors et un délai serré, Livewire est le meilleur choix. Tu évites le contexte switch entre backend/frontend, les juniors apprennent plus vite, et tu peux livrer les tableaux dynamiques avec Livewire + Alpine.js pour le drag & drop.\n\nVue + Inertia est aussi une bonne option mais demande plus de montée en compétence. Mon conseil : commence avec Livewire, si un composant devient trop complexe, isole-le en Vue avec une API dédiée.',
       5
from public.questions q
where q.title LIKE '%Laravel + Vue%';

insert into public.answers (question_id, author_id, body, score)
select q.id,
       '260cf30d-4254-4320-8330-55b849038283',
       E'Chrome DevTools throttling est un début mais tu as raison, ça ne suffit pas. Ce qui marche bien :\n\n1. Un proxy local (mitmproxy ou Charles) pour injecter des latences aléatoires et simuler les pertes de paquets\n2. Des tests d\'intégration avec des timeouts courts et des retry exponentiels\n3. Le mode offline de PWA avec Service Worker + cache local pour les données critiques\n\nL\'important c\'est de tester le comportement de ton app quand la requête échoue, pas juste quand elle est lente.',
       4
from public.questions q
where q.title LIKE '%tester une API Mobile Money%';

insert into public.answers (question_id, author_id, body, score)
select q.id,
       '260cf30d-4254-4320-8330-55b849038283',
       E'Pour la facturation en ligne, je te conseille de facturer en XOF avec paiement Mobile Money (Wave, Orange Money). C\'est ce que les PME connaissent et utilisent au quotidien.\n\nPour le pricing : un abonnement mensuel en XOF (5 000 - 15 000 FCFA) avec un essai gratuit de 14 jours. Évite les paiements en EUR ou USD, ça crée une friction inutile pour les petites entreprises.',
       3
from public.questions q
where q.title LIKE '%stratégie de pricing%';

-- Marquer la première réponse comme acceptée
update public.questions set accepted_answer_id = (
  select id from public.answers
  where question_id = public.questions.id
  order by score desc limit 1
)
where title LIKE '%webhook Wave%';
