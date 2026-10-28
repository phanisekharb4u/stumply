# Each section: [icon, title, list type, [items], optional note]. [[x]] marks a button/tab name.
HELP={
'en':{
 'intro':'Tap a heading to open it. <b>Admins</b> run tournaments and score matches. <b>Viewers</b> only watch, and need no account.',
 'sections':[
 ['🚀','Quick start: your first match in 5 minutes','ol',[
  'Open stumply.pages.dev and use the [[Organisers: sign in to score]] box at the top of the page. The first time, tap [[Register]].',
  'One game only? In [[Admin]] tap [[New single match]]. A whole tournament? Type a name and tap [[New tournament]].',
  'In [[Admin]], add the two teams and their players under [[Add Team + Squad]].',
  'Open [[Matches]], tap [[+ Schedule]], pick the two teams and tap [[Schedule]].',
  'Tap [[Start]] on the match, do the toss, pick the openers and bowler, and score ball by ball.',
  'In [[Admin]] tap [[Copy Link]] and send it on WhatsApp so everyone can watch live.'],
  'Each step is explained in more detail below.'],
 ['👁','Watch live scores (viewers)','ol',[
  'Open the share link the admin sent you. No sign-in is needed.',
  'Or open stumply.pages.dev. Under [[Watch a match live]] (on a phone, scroll down past the sign-in box), type the tournament name, city or the admin\'s username and tap [[Watch]], or tap a match in the list.',
  'The [[Live]] tab shows the score, batters, bowler and ball-by-ball commentary. It updates by itself after every ball.',
  'Between innings you see the innings break with the target.',
  'Use [[Scores]] for full scorecards and [[History]] for results, points table, stats, knockouts and awards. Tap a player name to see their profile.'],
  'Viewers cannot change anything. Tap 🔔 (or Yes, notify me) for match alerts: match start, wickets, 50s and 100s, and the result. On iPhone and iPad, alerts reach the lock screen only after you add Stumply to the Home Screen (Share → Add to Home Screen) and open it from that icon; otherwise they show inside the app while it is open.'],
 ['🔑','Create an account and sign in (admins)','ol',[
  'On the sign-in screen tap [[Register]].',
  'Enter your name, a username (viewers use it to find you), your email and a password of at least 6 characters. Tap 👁 to check the password you typed.',
  'Or tap [[Continue with Google]] or Continue with X to use that account instead.',
  'Next time, sign in under [[Sign In]] with the same email or the same Google / X button.',
  'Forgot the password? Tap [[Forgot password?]] and a reset link is emailed to you. Check spam too.'],''],
 ['🏏','Play a single match (one game, no tournament)','ol',[
  'Open [[Admin]]. Under [[My Tournaments]], type a name such as "Sunday match" (optional) and tap [[New single match]].',
  'Under [[Tournament Info]], set the overs and [[Players per side]], then tap [[Save Tournament]].',
  'Add the two teams under [[Add Team + Squad]].',
  'Open [[Matches]], tap [[+ Schedule]], choose the two teams and tap [[Schedule]]. The stage is Friendly.',
  'Tap [[Start]] and score it. It gets its own share link, and there is no points table.'],
  'A single match holds one game. For another game, tap [[New single match]] again. Your old matches stay in My Tournaments.'],
 ['🏆','Create a tournament','ol',[
  'Open the [[Admin]] tab.',
  'Under [[My Tournaments]], type a name and tap [[New tournament]]. You can run as many as you like and switch between them with [[Open]].',
  'Under [[Tournament Info]], set the name, edition, year and overs per innings.',
  'Set [[Players per side]] (3 to 11) if you play 6-a-side, 8-a-side and so on. A side is all out when one batter is left.',
  'Optional: add the city and tick [[Show on the Discover page]] so people can find it.',
  'Tap [[Save Tournament]].'],
  'Each bowler may bowl at most one fifth of the overs (4 in a T20, 2 in a 10-over match).'],
 ['👥','Add teams and players','ol',[
  'In [[Admin]], go to [[Add Team + Squad]].',
  'Enter the team name, a code of 2 to 4 letters (for example TTA), and the city.',
  'Fill in every player (as many as players per side). Up to 3 substitutes are optional; substitutes can field but cannot bat or bowl.',
  'Tap [[Add Team]]. Repeat for every team.',
  'To change a squad later, use [[Edit Players]]: pick the team, then rename, renumber, change role, mark the captain, add or remove players.',
  'Photos are optional. Tap the camera circle next to a player, or in the Teams list for a team logo.'],''],
 ['📅','Schedule matches','ol',[
  'Open the [[Matches]] tab and tap [[+ Schedule]].',
  'Choose the two teams. The playing XI is filled in from each squad (last match first); edit it if needed.',
  'Choose the stage (League, Group, Quarter Final, Semi Final, Final, or Friendly), the date, and optionally the venue and umpires.',
  'Tap [[Schedule]]. The match appears as Upcoming for you and for viewers.',
  'On an upcoming match you can [[Edit]], [[Delete]], or move it up and down the list.'],
  'Only League and Group matches count towards the points table. Semi-finals and the final can be made in one tap from History → Knockouts.'],
 ['🔴','Score a match live','ol',[
  'On the match card tap [[Start]]. Set the toss, then pick the two openers and the opening bowler.',
  'For each ball tap the runs: [[DOT]] [[1]] [[2]] [[3]] [[4]] [[6]].',
  '[[WIDE]] and [[NO BALL]]: enter the total for that ball including the 1 penalty run. For a no ball, tick the box if the runs came off the bat. The ball after a no ball is a free hit, unless the free hit is switched off in Match rules.',
  '[[BYE]] and [[LEG BYE]]: enter the runs taken.',
  '[[WICKET]]: choose how the batter was out, the fielder if caught, stumped or run out, and the next batter.',
  'At the end of each over, choose the next bowler. The bowler of the last over and bowlers who used their quota are greyed out.',
  'Made a mistake? Tap [[Undo last ball]]. It works again and again. After a match ends it asks before reopening it.',
  '[[Manage Players / Bowler]] changes the batters or bowler mid-over. [[Retired Hurt]] takes a batter off without a wicket; bring them back later from Manage.',
  '[[Discard Match]] ends the match as No Result, resets it to play again, or deletes it.'],
  'The innings ends by itself when the overs are bowled, the side is all out, or the target is reached. If the internet drops, keep scoring; it saves when you are back online.'],
 ['⚡','Ties, rain and shorter matches','ul',[
  'Match tied? Tap [[Play Super Over]] on the result popup or the Live tab. Each side gets one over and 2 wickets. The team that batted second bats first.',
  'If the Super Over is tied too, play another (Super Over 2). Batters out in the last Super Over, and its bowler, cannot play in the next one.',
  'The Super Over winner gets the points. Super Over runs are not added to player stats or NRR.',
  'Rain or bad light? While scoring, tap [[Reduce overs]] and enter the new overs per side.',
  'In the second innings Stumply suggests a revised target by run rate. It is not official DLS, so you can type your own target instead.'],''],
 ['🔗','Share scores with your audience','ol',[
  'In [[Admin]] → [[Tournament Info]], tap [[Copy Link]].',
  'Send the link by WhatsApp or SMS. Anyone who opens it can watch, with no account.',
  'Each tournament and single match has its own link. Viewers can also find you by your username.',
  'Tap [[Share score as image]] on the Live tab, or [[Share image]] on a scorecard, to send a score picture. On a computer the picture downloads instead.',
  'Tap [[Print / PDF]] on a scorecard to print it. On a phone, choose Save as PDF.'],''],
 ['🤝','Co-scorers (scoring with a friend)','ol',[
  'Ask your friend to create their own Stumply account.',
  'In [[Admin]] → [[Co-scorers]], type their username and tap [[Add co-scorer]].',
  'They sign in and find the tournament under [[YOU SCORE FOR]] in their [[My Tournaments]] list.',
  'Co-scorers can schedule, start and score matches. Only you can change settings, teams and photos, and you can remove them any time.'],
  'Only one person should score a live match at a time. Changes made by the other person show up within a few seconds.'],
 ['🏅','After the match','ul',[
  'When a match ends, the app suggests a Player of the Match. Keep it or choose another player.',
  'The full scorecard and commentary are in [[Scores]].',
  'In [[History]] → [[Awards]] you will find the Player of the Series, Orange Cap, Purple Cap and other awards. Admins can choose the Player of the Series themselves.'],''],
 ['📊','History, stats and knockouts','ul',[
  '[[Completed Matches]]: every result. Tap a match for its scorecard.',
  '[[Points Table]]: win 2 points, tie or no result 1 point each, ranked by points then net run rate. Q marks teams in the knockouts.',
  '[[Knockouts]]: quarter-finals, semi-finals and final as a bracket. Admins can create semi-finals from the points table (1st v 4th, 2nd v 3rd), or a final, in one tap.',
  '[[Batting]], [[Bowling]], [[Fielding]]: totals for every player. M is matches played.',
  'Tap any player name to open their profile with their stats and every match they played.',
  'Past tournaments stay in My Tournaments, so their history is always there.'],''],
 ['🗑','Delete or correct things','ul',[
  'A wrong ball: [[Undo last ball]] on the Live screen.',
  'A match: [[Delete]] on its card in Matches.',
  'A team: ✕ in Admin → Teams. If it has matches, they are deleted with it after you confirm.',
  'A tournament: open a different one first, then tap the bin next to it in My Tournaments.',
  'Deletions cannot be undone.'],''],
 ['📱','Phone, language and offline','ul',[
  'Works in any browser on Android, iPhone, tablet or computer: open stumply.pages.dev.',
  'Install it like an app: in your phone browser menu choose Add to Home Screen.',
  'Change language with the [[🌐]] button: English, Telugu, Hindi, Tamil, Kannada or Malayalam.',
  'Scoring keeps working without internet and saves when the connection returns.'],''],
 ]},
'te':{
 'intro':'తెరవడానికి శీర్షికను నొక్కండి. <b>అడ్మిన్‌లు</b> టోర్నమెంట్లు నిర్వహించి మ్యాచ్‌లు స్కోర్ చేస్తారు. <b>వీక్షకులు</b> చూడటం మాత్రమే; వారికి ఖాతా అవసరం లేదు.',
 'sections':[
 ['🚀','త్వరగా మొదలుపెట్టండి: 5 నిమిషాల్లో మొదటి మ్యాచ్','ol',[
  'stumply.pages.dev తెరిచి [[నిర్వాహకులు: స్కోర్ చేయడానికి సైన్ ఇన్ అవ్వండి]] బాక్స్ వాడండి (పేజీ పైభాగంలో ఉంటుంది). మొదటిసారి అయితే [[నమోదు]] నొక్కండి.',
  'ఒక్క మ్యాచ్ మాత్రమేనా? [[అడ్మిన్]]లో [[కొత్త సింగిల్ మ్యాచ్]] నొక్కండి. పూర్తి టోర్నమెంట్ అయితే పేరు టైప్ చేసి [[కొత్త టోర్నమెంట్]] నొక్కండి.',
  '[[అడ్మిన్]]లో [[జట్టు + ఆటగాళ్ళను చేర్చు]] కింద రెండు జట్లను, ఆటగాళ్ళను చేర్చండి.',
  '[[మ్యాచ్‌లు]] తెరిచి [[+ షెడ్యూల్]] నొక్కి, రెండు జట్లను ఎంచుకుని [[షెడ్యూల్]] నొక్కండి.',
  'మ్యాచ్‌పై [[ప్రారంభించు]] నొక్కి, టాస్ పెట్టి, ఓపెనర్లను, బౌలర్‌ను ఎంచుకుని బంతి బంతికి స్కోర్ చేయండి.',
  '[[అడ్మిన్]]లో [[లింక్ కాపీ చేయి]] నొక్కి WhatsAppలో పంపండి; అందరూ లైవ్‌గా చూడవచ్చు.'],
  'ప్రతి దశ కింద వివరంగా ఉంది.'],
 ['👁','లైవ్ స్కోర్లు చూడటం (వీక్షకులు)','ol',[
  'అడ్మిన్ పంపిన షేర్ లింక్ తెరవండి. సైన్ ఇన్ అవసరం లేదు.',
  'లేదా stumply.pages.dev తెరవండి. [[మ్యాచ్‌ను లైవ్‌గా చూడండి]] (ఫోన్‌లో సైన్ ఇన్ బాక్స్ దాటి కిందకు స్క్రోల్ చేయండి) కింద టోర్నమెంట్ పేరు, నగరం లేదా అడ్మిన్ యూజర్‌నేమ్ టైప్ చేసి [[చూడండి]] నొక్కండి, లేదా జాబితాలో మ్యాచ్‌ను నొక్కండి.',
  '[[లైవ్]] ట్యాబ్‌లో స్కోర్, బ్యాటర్లు, బౌలర్, బంతి-బంతి కామెంటరీ ఉంటాయి. ప్రతి బంతి తర్వాత దానంతట అదే అప్‌డేట్ అవుతుంది.',
  'ఇన్నింగ్స్ మధ్యలో లక్ష్యంతో ఇన్నింగ్స్ విరామం కనిపిస్తుంది.',
  'పూర్తి స్కోర్‌కార్డ్‌ల కోసం [[స్కోర్లు]], ఫలితాలు, పాయింట్ల పట్టిక, గణాంకాలు, నాకౌట్స్, అవార్డుల కోసం [[చరిత్ర]] చూడండి. ఆటగాడి పేరు నొక్కితే ప్రొఫైల్ వస్తుంది.'],
  'వీక్షకులు ఏదీ మార్చలేరు. మ్యాచ్ అలర్ట్‌ల కోసం 🔔 (లేదా అవును, తెలియజేయండి) నొక్కండి: మ్యాచ్ మొదలు, వికెట్లు, 50, 100, ఫలితం. iPhone, iPadలో Stumplyని హోమ్ స్క్రీన్‌కు చేర్చి (Share → Add to Home Screen) ఆ ఐకాన్ నుండి తెరిస్తేనే లాక్ స్క్రీన్‌పై అలర్ట్‌లు వస్తాయి; లేకపోతే యాప్ తెరిచి ఉన్నప్పుడు యాప్‌లోనే కనిపిస్తాయి.'],
 ['🔑','ఖాతా సృష్టించడం, సైన్ ఇన్ (అడ్మిన్‌లు)','ol',[
  'సైన్ ఇన్ స్క్రీన్‌లో [[నమోదు]] నొక్కండి.',
  'మీ పేరు, యూజర్‌నేమ్ (వీక్షకులు దీనితో మిమ్మల్ని వెతుకుతారు), ఈమెయిల్, కనీసం 6 అక్షరాల పాస్‌వర్డ్ ఇవ్వండి. టైప్ చేసిన పాస్‌వర్డ్ చూడటానికి 👁 నొక్కండి.',
  'లేదా [[Googleతో కొనసాగించండి]] లేదా X బటన్‌తో ఆ ఖాతాను వాడండి.',
  'తర్వాతి సారి [[సైన్ ఇన్]]లో అదే ఈమెయిల్‌తో లేదా అదే Google / X బటన్‌తో ప్రవేశించండి.',
  'పాస్‌వర్డ్ మర్చిపోయారా? [[పాస్‌వర్డ్ మర్చిపోయారా?]] నొక్కితే రీసెట్ లింక్ మీ ఈమెయిల్‌కు వస్తుంది. స్పామ్‌లో కూడా చూడండి.'],''],
 ['🏏','సింగిల్ మ్యాచ్ ఆడటం (టోర్నమెంట్ లేకుండా ఒక్క ఆట)','ol',[
  '[[అడ్మిన్]] తెరవండి. [[నా టోర్నమెంట్లు]] కింద "ఆదివారం మ్యాచ్" లాంటి పేరు టైప్ చేసి (ఐచ్ఛికం) [[కొత్త సింగిల్ మ్యాచ్]] నొక్కండి.',
  '[[టోర్నమెంట్ వివరాలు]] కింద ఓవర్లు, [[ఒక్కో జట్టుకు ఆటగాళ్ళు]] పెట్టి [[టోర్నమెంట్ సేవ్ చేయి]] నొక్కండి.',
  '[[జట్టు + ఆటగాళ్ళను చేర్చు]] కింద రెండు జట్లను చేర్చండి.',
  '[[మ్యాచ్‌లు]] తెరిచి [[+ షెడ్యూల్]] నొక్కి, రెండు జట్లను ఎంచుకుని [[షెడ్యూల్]] నొక్కండి. దశ "ఫ్రెండ్లీ".',
  '[[ప్రారంభించు]] నొక్కి స్కోర్ చేయండి. దీనికి సొంత షేర్ లింక్ ఉంటుంది; పాయింట్ల పట్టిక ఉండదు.'],
  'సింగిల్ మ్యాచ్‌లో ఒక్క ఆటే ఉంటుంది. మరో ఆట కోసం మళ్ళీ [[కొత్త సింగిల్ మ్యాచ్]] నొక్కండి. పాత మ్యాచ్‌లు "నా టోర్నమెంట్లు"లో ఉంటాయి.'],
 ['🏆','టోర్నమెంట్ సృష్టించడం','ol',[
  '[[అడ్మిన్]] ట్యాబ్ తెరవండి.',
  '[[నా టోర్నమెంట్లు]] కింద పేరు టైప్ చేసి [[కొత్త టోర్నమెంట్]] నొక్కండి. ఎన్ని టోర్నమెంట్లైనా నిర్వహించవచ్చు; [[తెరువు]]తో వాటి మధ్య మారవచ్చు.',
  '[[టోర్నమెంట్ వివరాలు]] కింద పేరు, ఎడిషన్, సంవత్సరం, ఇన్నింగ్స్‌కు ఓవర్లు పెట్టండి.',
  '6 లేదా 8 మంది జట్లతో ఆడితే [[ఒక్కో జట్టుకు ఆటగాళ్ళు]] (3 నుండి 11) పెట్టండి. ఒక్క బ్యాటర్ మిగిలితే జట్టు ఆలౌట్.',
  'ఐచ్ఛికం: నగరం పెట్టి [[డిస్కవర్ పేజీలో చూపించు]] టిక్ చేస్తే ఇతరులు కూడా కనుగొనగలరు.',
  '[[టోర్నమెంట్ సేవ్ చేయి]] నొక్కండి.'],
  'ఒక బౌలర్ మొత్తం ఓవర్లలో ఐదో వంతు మాత్రమే వేయగలడు (T20లో 4, 10 ఓవర్ల మ్యాచ్‌లో 2).'],
 ['👥','జట్లు, ఆటగాళ్ళను చేర్చడం','ol',[
  '[[అడ్మిన్]]లో [[జట్టు + ఆటగాళ్ళను చేర్చు]]కు వెళ్ళండి.',
  'జట్టు పేరు, 2 నుండి 4 అక్షరాల కోడ్ (ఉదా. TTA), నగరం ఇవ్వండి.',
  'ప్రతి ఆటగాడి పేరు నింపండి (ఒక్కో జట్టుకు ఆటగాళ్ళు ఎంతమందో అంతమంది). 3 వరకు సబ్‌లు ఐచ్ఛికం; సబ్‌లు ఫీల్డింగ్ చేయగలరు కానీ బ్యాటింగ్, బౌలింగ్ చేయలేరు.',
  '[[జట్టును చేర్చు]] నొక్కండి. ప్రతి జట్టుకూ ఇలాగే చేయండి.',
  'తర్వాత జట్టును మార్చాలంటే [[ఆటగాళ్ళను మార్చు]] వాడండి: జట్టును ఎంచుకుని పేరు, నంబర్, పాత్ర మార్చండి, కెప్టెన్‌ను గుర్తించండి, ఆటగాళ్ళను చేర్చండి లేదా తీసేయండి.',
  'ఫోటోలు ఐచ్ఛికం. ఆటగాడి పక్కన ఉన్న కెమెరా వృత్తాన్ని నొక్కండి; జట్టు లోగో కోసం జట్ల జాబితాలోని వృత్తాన్ని నొక్కండి.'],''],
 ['📅','మ్యాచ్‌లు షెడ్యూల్ చేయడం','ol',[
  '[[మ్యాచ్‌లు]] ట్యాబ్ తెరిచి [[+ షెడ్యూల్]] నొక్కండి.',
  'రెండు జట్లను ఎంచుకోండి. ఆడే XI జట్టు నుండి నిండుతుంది (చివరి మ్యాచ్ ఆడినవారు ముందు); అవసరమైతే మార్చండి.',
  'దశ (లీగ్, గ్రూప్, క్వార్టర్ ఫైనల్, సెమీ ఫైనల్, ఫైనల్ లేదా ఫ్రెండ్లీ), తేదీ ఎంచుకోండి; మైదానం, అంపైర్లు ఐచ్ఛికం.',
  '[[షెడ్యూల్]] నొక్కండి. మ్యాచ్ మీకూ, వీక్షకులకూ "రాబోయేది"గా కనిపిస్తుంది.',
  'రాబోయే మ్యాచ్‌ను [[మార్చు]], [[తొలగించు]] చేయవచ్చు లేదా జాబితాలో పైకి కిందికి జరపవచ్చు.'],
  'లీగ్, గ్రూప్ మ్యాచ్‌లు మాత్రమే పాయింట్ల పట్టికలో లెక్కించబడతాయి. సెమీ ఫైనల్స్, ఫైనల్‌ను చరిత్ర → నాకౌట్స్‌లో ఒక్క ట్యాప్‌తో సృష్టించవచ్చు.'],
 ['🔴','మ్యాచ్‌ను లైవ్‌గా స్కోర్ చేయడం','ol',[
  'మ్యాచ్ కార్డ్‌లో [[ప్రారంభించు]] నొక్కండి. టాస్ పెట్టి, ఇద్దరు ఓపెనర్లను, మొదటి బౌలర్‌ను ఎంచుకోండి.',
  'ప్రతి బంతికి పరుగులు నొక్కండి: [[డాట్]] [[1]] [[2]] [[3]] [[4]] [[6]].',
  '[[వైడ్]], [[నో బాల్]]: ఆ బంతికి మొత్తం పరుగులు, 1 పెనాల్టీ పరుగుతో కలిపి ఇవ్వండి. నో బాల్‌లో పరుగులు బ్యాట్ నుండి వస్తే బాక్స్ టిక్ చేయండి. నో బాల్ తర్వాతి బంతి ఫ్రీ హిట్, మ్యాచ్ నియమాలలో ఫ్రీ హిట్ ఆపితే తప్ప.',
  '[[బై]], [[లెగ్ బై]]: తీసిన పరుగులు ఇవ్వండి.',
  '[[వికెట్]]: బ్యాటర్ ఎలా అవుటయ్యాడో, క్యాచ్, స్టంప్డ్ లేదా రన్ అవుట్ అయితే ఫీల్డర్‌ను, తదుపరి బ్యాటర్‌ను ఎంచుకోండి.',
  'ప్రతి ఓవర్ చివర తదుపరి బౌలర్‌ను ఎంచుకోండి. గత ఓవర్ వేసిన బౌలర్, కోటా పూర్తయిన బౌలర్లు బూడిద రంగులో ఉంటారు.',
  'పొరపాటు జరిగిందా? [[చివరి బంతి రద్దు]] నొక్కండి. ఇది ఎన్నిసార్లైనా పనిచేస్తుంది. మ్యాచ్ ముగిశాక మళ్ళీ తెరవడానికి ముందు అడుగుతుంది.',
  '[[ఆటగాళ్ళు / బౌలర్ మార్చు]] ఓవర్ మధ్యలో బ్యాటర్లను లేదా బౌలర్‌ను మారుస్తుంది. [[రిటైర్డ్ హర్ట్]] వికెట్ లేకుండా బ్యాటర్‌ను బయటకు పంపుతుంది; తర్వాత మేనేజ్ నుండి మళ్ళీ తీసుకురావచ్చు.',
  '[[మ్యాచ్ రద్దు చేయి]] మ్యాచ్‌ను "ఫలితం లేదు"గా ముగిస్తుంది, మళ్ళీ ఆడటానికి రీసెట్ చేస్తుంది లేదా తొలగిస్తుంది.'],
  'ఓవర్లు పూర్తయినా, జట్టు ఆలౌట్ అయినా, లక్ష్యం చేరినా ఇన్నింగ్స్ దానంతట అదే ముగుస్తుంది. ఇంటర్నెట్ పోయినా స్కోర్ చేస్తూ ఉండండి; తిరిగి వచ్చాక సేవ్ అవుతుంది.'],
 ['⚡','టై, వర్షం, చిన్న మ్యాచ్‌లు','ul',[
  'మ్యాచ్ టై అయిందా? ఫలితం పాప్అప్‌లో లేదా లైవ్ ట్యాబ్‌లో [[సూపర్ ఓవర్ ఆడండి]] నొక్కండి. ఒక్కో జట్టుకు ఒక ఓవర్, 2 వికెట్లు. రెండో బ్యాటింగ్ చేసిన జట్టు ముందు బ్యాటింగ్ చేస్తుంది.',
  'సూపర్ ఓవర్ కూడా టై అయితే మరోటి ఆడండి (సూపర్ ఓవర్ 2). గత సూపర్ ఓవర్‌లో అవుటైన బ్యాటర్లు, దాని బౌలర్ తదుపరి దానిలో ఆడలేరు.',
  'సూపర్ ఓవర్ విజేతకు పాయింట్లు. సూపర్ ఓవర్ పరుగులు ఆటగాళ్ళ గణాంకాల్లో, NRRలో కలవవు.',
  'వర్షం లేదా వెలుతురు తగ్గిందా? స్కోర్ చేస్తూనే [[ఓవర్లు తగ్గించు]] నొక్కి ఒక్కో జట్టుకు కొత్త ఓవర్లు ఇవ్వండి.',
  'రెండో ఇన్నింగ్స్‌లో రన్ రేట్ ప్రకారం సవరించిన లక్ష్యాన్ని Stumply సూచిస్తుంది. ఇది అధికారిక DLS కాదు; మీ లక్ష్యాన్ని మీరే టైప్ చేయవచ్చు.'],''],
 ['🔗','ప్రేక్షకులతో స్కోర్లు పంచుకోవడం','ol',[
  '[[అడ్మిన్]] → [[టోర్నమెంట్ వివరాలు]]లో [[లింక్ కాపీ చేయి]] నొక్కండి.',
  'లింక్‌ను WhatsApp లేదా SMS ద్వారా పంపండి. తెరిచిన ఎవరైనా ఖాతా లేకుండా చూడవచ్చు.',
  'ప్రతి టోర్నమెంట్‌కు, సింగిల్ మ్యాచ్‌కు సొంత లింక్ ఉంటుంది. వీక్షకులు మీ యూజర్‌నేమ్‌తో కూడా మిమ్మల్ని వెతకవచ్చు.',
  'లైవ్ ట్యాబ్‌లో [[స్కోర్‌ను చిత్రంగా పంచుకోండి]] లేదా స్కోర్‌కార్డ్‌లో [[చిత్రం పంచుకోండి]] నొక్కి స్కోర్ చిత్రాన్ని పంపండి. కంప్యూటర్‌లో చిత్రం డౌన్‌లోడ్ అవుతుంది.',
  'స్కోర్‌కార్డ్‌లో [[ప్రింట్ / PDF]] నొక్కితే ప్రింట్ చేయవచ్చు. ఫోన్‌లో Save as PDF ఎంచుకోండి.'],''],
 ['🤝','సహ స్కోరర్లు (స్నేహితుడితో కలిసి స్కోరింగ్)','ol',[
  'మీ స్నేహితుడిని సొంత Stumply ఖాతా సృష్టించమనండి.',
  '[[అడ్మిన్]] → [[సహ స్కోరర్లు]]లో వారి యూజర్‌నేమ్ టైప్ చేసి [[సహ స్కోరర్‌ను చేర్చు]] నొక్కండి.',
  'వారు సైన్ ఇన్ అయ్యాక [[నా టోర్నమెంట్లు]]లో [[మీరు స్కోర్ చేసేవి]] కింద టోర్నమెంట్ కనిపిస్తుంది.',
  'సహ స్కోరర్లు మ్యాచ్‌లను షెడ్యూల్ చేయగలరు, ప్రారంభించగలరు, స్కోర్ చేయగలరు. సెట్టింగ్‌లు, జట్లు, ఫోటోలను మీరు మాత్రమే మార్చగలరు; ఎప్పుడైనా వారిని తొలగించవచ్చు.'],
  'లైవ్ మ్యాచ్‌ను ఒకసారి ఒక్కరే స్కోర్ చేయాలి. మరొకరు చేసిన మార్పులు కొన్ని సెకన్లలో కనిపిస్తాయి.'],
 ['🏅','మ్యాచ్ తర్వాత','ul',[
  'మ్యాచ్ ముగియగానే యాప్ ప్లేయర్ ఆఫ్ ది మ్యాచ్‌ను సూచిస్తుంది. దాన్నే ఉంచండి లేదా వేరే ఆటగాడిని ఎంచుకోండి.',
  'పూర్తి స్కోర్‌కార్డ్, కామెంటరీ [[స్కోర్లు]]లో ఉంటాయి.',
  '[[చరిత్ర]] → [[అవార్డులు]]లో ప్లేయర్ ఆఫ్ ది సిరీస్, ఆరెంజ్ క్యాప్, పర్పుల్ క్యాప్, ఇతర అవార్డులు ఉంటాయి. ప్లేయర్ ఆఫ్ ది సిరీస్‌ను అడ్మిన్ స్వయంగా ఎంచుకోవచ్చు.'],''],
 ['📊','చరిత్ర, గణాంకాలు, నాకౌట్స్','ul',[
  '[[పూర్తయిన మ్యాచ్‌లు]]: ప్రతి ఫలితం. స్కోర్‌కార్డ్ కోసం మ్యాచ్‌ను నొక్కండి.',
  '[[పాయింట్ల పట్టిక]]: గెలుపుకు 2 పాయింట్లు, టై లేదా ఫలితం లేకపోతే చెరో 1 పాయింట్; పాయింట్లు, తర్వాత నెట్ రన్ రేట్ ప్రకారం ర్యాంక్. నాకౌట్స్‌కు అర్హత పొందిన జట్లకు Q.',
  '[[నాకౌట్స్]]: క్వార్టర్ ఫైనల్, సెమీ ఫైనల్, ఫైనల్ బ్రాకెట్‌గా. పాయింట్ల పట్టిక నుండి సెమీ ఫైనల్స్ (1 v 4, 2 v 3) లేదా ఫైనల్‌ను అడ్మిన్ ఒక్క ట్యాప్‌తో సృష్టించవచ్చు.',
  '[[బ్యాటింగ్]], [[బౌలింగ్]], [[ఫీల్డింగ్]]: ప్రతి ఆటగాడి మొత్తాలు. M అంటే ఆడిన మ్యాచ్‌లు.',
  'ఏ ఆటగాడి పేరు నొక్కినా వారి గణాంకాలు, ఆడిన ప్రతి మ్యాచ్‌తో ప్రొఫైల్ తెరుచుకుంటుంది.',
  'పాత టోర్నమెంట్లు "నా టోర్నమెంట్లు"లో ఉంటాయి; వాటి చరిత్ర ఎప్పుడైనా చూడవచ్చు.'],''],
 ['🗑','తొలగించడం, సరిచేయడం','ul',[
  'తప్పు బంతి: లైవ్ స్క్రీన్‌లో [[చివరి బంతి రద్దు]].',
  'మ్యాచ్: మ్యాచ్‌లు ట్యాబ్‌లో దాని కార్డ్‌పై [[తొలగించు]].',
  'జట్టు: అడ్మిన్ → జట్లులో ✕. దానికి మ్యాచ్‌లు ఉంటే, మీరు నిర్ధారించాక అవి కూడా తొలగిపోతాయి.',
  'టోర్నమెంట్: ముందు వేరే టోర్నమెంట్ తెరిచి, తర్వాత "నా టోర్నమెంట్లు"లో దాని పక్కన ఉన్న బిన్ నొక్కండి.',
  'తొలగించినవి వెనక్కి తీసుకురాలేరు.'],''],
 ['📱','ఫోన్, భాష, ఆఫ్‌లైన్','ul',[
  'Android, iPhone, టాబ్లెట్ లేదా కంప్యూటర్‌లో ఏ బ్రౌజర్‌లోనైనా పనిచేస్తుంది: stumply.pages.dev తెరవండి.',
  'యాప్‌లా ఇన్‌స్టాల్ చేయండి: ఫోన్ బ్రౌజర్ మెనూలో "Add to Home Screen" ఎంచుకోండి.',
  '[[🌐]] బటన్‌తో భాష మార్చండి: ఇంగ్లీష్, తెలుగు, హిందీ, తమిళం, కన్నడ, మలయాళం.',
  'ఇంటర్నెట్ లేకపోయినా స్కోరింగ్ పనిచేస్తుంది; కనెక్షన్ వచ్చాక సేవ్ అవుతుంది.'],''],
 ]},
}

# Match-day extras (added after "Share scores")
_NEW={
'en':['🎉','Match-day extras','ul',[
  '[[Match rules]] in Admin → Tournament Info: tick [[Last man stands]] so the last batter can bat on alone (always on strike), tick [[No LBW]], or untick [[Free hit after a no ball]]. Changes apply from the next innings.',
  '[[WhatsApp update]] on the Live tab sends the current score, batters, bowler and target to WhatsApp with the watch link. [[WhatsApp scorecard]] on a scorecard sends the full card as text. In History → Awards, [[Share awards on WhatsApp]] sends the award list for prize giving.',
  '[[Match graphs]] at the bottom of every scorecard: the worm (runs after each over), the Manhattan (runs in each over, red dots are wickets) and partnerships. Tap the charts to see the numbers.',
  '[[Fan poll]]: on the Live tab, viewers tap the team they think will win. Voting closes when the second innings starts.',
  '[[Speak score]]: tap it on the Live tab and the phone reads out each ball and the score, for example "Four! Test Team A 86 for 3". Keep the phone volume up.',
  '[[Entry fees]] in Admin: set the fee per team and record what each team has paid. You see what is collected and what is still pending. Viewers do not see this list.'],
  'The spoken score is in English. The fan poll needs the internet.'],
'te':['🎉','మ్యాచ్ రోజు అదనపు సౌకర్యాలు','ul',[
  '[[అడ్మిన్]] → [[టోర్నమెంట్ వివరాలు]] లో [[మ్యాచ్ నియమాలు]]: చివరి బ్యాటర్ ఒంటరిగా ఆడాలంటే [[లాస్ట్ మ్యాన్ స్టాండ్స్]] టిక్ చేయండి (స్ట్రైక్ ఎప్పుడూ అతనిదే), [[LBW లేదు]] టిక్ చేయండి, లేదా [[నో బాల్ తర్వాత ఫ్రీ హిట్]] టిక్ తీసేయండి. మార్పులు తదుపరి ఇన్నింగ్స్ నుండి అమలవుతాయి.',
  '[[లైవ్]] ట్యాబ్‌లో [[వాట్సాప్ అప్‌డేట్]] ప్రస్తుత స్కోర్, బ్యాటర్లు, బౌలర్, లక్ష్యం మరియు చూసే లింక్‌ను వాట్సాప్‌కు పంపుతుంది. స్కోర్‌కార్డ్‌లో [[వాట్సాప్ స్కోర్‌కార్డ్]] పూర్తి కార్డ్‌ను టెక్స్ట్‌గా పంపుతుంది. [[చరిత్ర]] → [[అవార్డులు]] లో [[అవార్డులను వాట్సాప్‌లో పంపండి]] బహుమతి ప్రదానం కోసం అవార్డుల జాబితా పంపుతుంది.',
  'ప్రతి స్కోర్‌కార్డ్ కింద [[మ్యాచ్ గ్రాఫ్‌లు]]: వార్మ్ (ప్రతి ఓవర్ తర్వాత పరుగులు), మ్యాన్‌హట్టన్ (ప్రతి ఓవర్‌లో పరుగులు, ఎరుపు చుక్కలు వికెట్లు), భాగస్వామ్యాలు. సంఖ్యలు చూడటానికి గ్రాఫ్‌ను నొక్కండి.',
  '[[ఫ్యాన్ పోల్]]: [[లైవ్]] ట్యాబ్‌లో వీక్షకులు గెలుస్తుందని అనుకునే జట్టును నొక్కుతారు. రెండో ఇన్నింగ్స్ మొదలవగానే ఓటింగ్ ముగుస్తుంది.',
  '[[స్కోర్ వినిపించు]]: [[లైవ్]] ట్యాబ్‌లో నొక్కితే ప్రతి బంతి మరియు స్కోర్‌ను ఫోన్ చదివి వినిపిస్తుంది, ఉదా. "Four! Test Team A 86 for 3". ఫోన్ వాల్యూమ్ పెంచి ఉంచండి.',
  '[[అడ్మిన్]] లో [[ఎంట్రీ ఫీజులు]]: ఒక్కో జట్టు ఫీజు పెట్టి, ప్రతి జట్టు ఎంత చెల్లించిందో నమోదు చేయండి. ఎంత వసూలైంది, ఇంకా ఎంత రావాలో కనిపిస్తుంది. ఈ జాబితా వీక్షకులకు కనిపించదు.'],
  'స్కోర్ ఇంగ్లీష్‌లో వినిపిస్తుంది. ఫ్యాన్ పోల్‌కు ఇంటర్నెట్ అవసరం.'],
}
for _l,_sec in _NEW.items():
    _L=HELP[_l]['sections'];_i=next(k for k,x in enumerate(_L) if x[0]=='🔗');_L.insert(_i+1,_sec)

# The newer features, mentioned in the sections where people look for them (en, te)
_MORE={
'👁':(['On the [[Live]] tab you can also vote in the [[Fan poll]], tap [[Speak score]] to hear every ball, send the score to friends with [[WhatsApp update]], and open [[Graphs & scorecard]].'],
      ['[[లైవ్]] ట్యాబ్‌లో [[ఫ్యాన్ పోల్]]లో ఓటు వేయవచ్చు, ప్రతి బంతి వినడానికి [[స్కోర్ వినిపించు]] నొక్కవచ్చు, [[వాట్సాప్ అప్‌డేట్]]తో స్నేహితులకు స్కోర్ పంపవచ్చు, [[గ్రాఫ్‌లు & స్కోర్‌కార్డ్]] తెరవవచ్చు.']),
'🏆':(['Under [[Match rules]] choose Last man stands or No LBW, or switch off the free hit after a no ball.'],
      ['[[మ్యాచ్ నియమాలు]] కింద లాస్ట్ మ్యాన్ స్టాండ్స్ లేదా LBW లేదు ఎంచుకోండి, లేదా నో బాల్ తర్వాత ఫ్రీ హిట్ ఆపండి.']),
'🔴':(['Match rules change scoring: with Last man stands the last batter bats alone and always keeps the strike; with No LBW, LBW is greyed out; with the free hit switched off, there is no free hit after a no ball.'],
      ['మ్యాచ్ నియమాలు స్కోరింగ్‌ను మారుస్తాయి: లాస్ట్ మ్యాన్ స్టాండ్స్‌లో చివరి బ్యాటర్ ఒంటరిగా ఆడతాడు, స్ట్రైక్ ఎప్పుడూ అతనిదే; LBW లేదు అయితే LBW ఎంచుకోలేరు; ఫ్రీ హిట్ ఆపితే నో బాల్ తర్వాత ఫ్రీ హిట్ ఉండదు.']),
'🔗':(['[[WhatsApp update]] on the Live tab and [[WhatsApp scorecard]] on a scorecard send the score as text, with the watch link.'],
      ['[[లైవ్]] ట్యాబ్‌లో [[వాట్సాప్ అప్‌డేట్]], స్కోర్‌కార్డ్‌లో [[వాట్సాప్ స్కోర్‌కార్డ్]] స్కోర్‌ను టెక్స్ట్‌గా, చూసే లింక్‌తో పంపుతాయి.']),
'🏅':(['Every scorecard ends with the match graphs: worm, Manhattan and partnerships.','In [[History]] → [[Awards]], tap [[Share awards on WhatsApp]] to send the full award list for prize giving.'],
      ['ప్రతి స్కోర్‌కార్డ్ కింద మ్యాచ్ గ్రాఫ్‌లు ఉంటాయి: వార్మ్, మ్యాన్‌హట్టన్, భాగస్వామ్యాలు.','[[చరిత్ర]] → [[అవార్డులు]] లో [[అవార్డులను వాట్సాప్‌లో పంపండి]] నొక్కి బహుమతి ప్రదానం కోసం పూర్తి జాబితా పంపండి.']),
'📱':(['Match alerts: tap 🔔 to switch them on or off. On iPhone and iPad, alerts reach the lock screen only after you add Stumply to the Home Screen; in a Safari tab they show as a banner inside Stumply.'],
      ['మ్యాచ్ అలర్ట్‌లు: ఆన్ లేదా ఆఫ్ చేయడానికి 🔔 నొక్కండి. iPhone, iPad లో Stumply ని హోమ్ స్క్రీన్‌కు చేర్చిన తర్వాతే అలర్ట్‌లు లాక్ స్క్రీన్‌కు వస్తాయి; Safari ట్యాబ్‌లో అవి Stumply లోపల బ్యానర్‌గా కనిపిస్తాయి.']),
}
for _ic,(_en,_te) in _MORE.items():
    for _l,_items in (('en',_en),('te',_te)):
        _sec=next(x for x in HELP[_l]['sections'] if x[0]==_ic);_sec[3].extend(_items)

# Auto fixtures (en, te)
for _l,_t in (('en','Many teams? Tap [[Auto fixtures]] in Matches: choose the first date and how many matches a day, and every team gets a League match against every other team, spread over the days. Tick "Play each other twice" for return games.'),
              ('te','చాలా జట్లు ఉన్నాయా? మ్యాచ్‌లు లో [[ఆటో ఫిక్స్చర్లు]] నొక్కండి: మొదటి తేదీ, రోజుకు ఎన్ని మ్యాచ్‌లో ఎంచుకోండి, ప్రతి జట్టుకు మిగతా ప్రతి జట్టుతో ఒక లీగ్ మ్యాచ్ రోజులవారీగా తయారవుతుంది. రెండోసారి ఆడాలంటే "ఒకరితో ఒకరు రెండుసార్లు ఆడాలి" టిక్ చేయండి.')):
    next(x for x in HELP[_l]['sections'] if x[0]=='📅')[3].insert(1,_t)

# Wagon wheel (en, te)
for _l,_i,_t in (('en','🔴','Shot map (wagon wheel): after a 4 or a 6, tap where the ball went on the small field, or tap Skip. Change it at the top of the ball-by-ball card: off, 4s & 6s, or all runs.'),
                 ('te','🔴','షాట్ మ్యాప్ (వాగన్ వీల్): 4 లేదా 6 తర్వాత చిన్న మైదానంలో బంతి వెళ్లిన చోట నొక్కండి, లేదా Skip నొక్కండి. బంతి-బంతి కార్డ్ పైభాగంలో మార్చవచ్చు: ఆఫ్, 4లు & 6లు, లేదా అన్ని పరుగులు.'),
                 ('en','🏅','The wagon wheel on the scorecard shows where each marked shot went; pick a batter to see only their shots.'),
                 ('te','🏅','స్కోర్‌కార్డ్‌లోని వాగన్ వీల్ ప్రతి గుర్తించిన షాట్ ఎక్కడికి వెళ్లిందో చూపిస్తుంది; ఒక బ్యాటర్‌ను ఎంచుకుంటే వారి షాట్లు మాత్రమే కనిపిస్తాయి.')):
    next(x for x in HELP[_l]['sections'] if x[0]==_i)[3].append(_t)

# Career profile (en, te)
for _l,_t in (('en','Open a player and tap [[Career: all tournaments by this organiser]] to see their totals across every tournament the same organiser has run, even if they changed teams. Players are matched by name.'),
              ('te','ఆటగాడిని తెరిచి [[కెరీర్: ఈ నిర్వాహకుడి అన్ని టోర్నమెంట్లు]] నొక్కండి: అదే నిర్వాహకుడి అన్ని టోర్నమెంట్లలో వారి మొత్తం గణాంకాలు కనిపిస్తాయి, జట్టు మారినా సరే. ఆటగాళ్లను పేరుతో కలుపుతాము.')):
    next(x for x in HELP[_l]['sections'] if x[0]=='📊')[3].append(_t)

# Ask Stumply helper (en, te)
for _l,_t in (('en','Stuck? Tap ❓ Help at the top and type your question, for example "how do I add players". The answer comes from this guide, with a button to the right screen. Tap 📖 Full guide there to read this guide.'),
              ('te','సందేహమా? పైన ఉన్న ❓ సహాయం నొక్కి మీ ప్రశ్న టైప్ చేయండి, ఉదా. "ఆటగాళ్లను ఎలా చేర్చాలి". ఈ గైడ్ నుండి సమాధానం, సరైన స్క్రీన్‌కు బటన్‌తో వస్తుంది. ఈ గైడ్ చదవడానికి అక్కడ 📖 పూర్తి గైడ్ నొక్కండి.')):
    next(x for x in HELP[_l]['sections'] if x[0]=='🚀')[3].append(_t)


# Player accounts (en, te)
for _l,_t in (('en','Players can have their own free Stumply account. Sign in (Google is quickest), open your name in any tournament (Players, a scorecard or Stats) and tap [[🙋 This is me: add to my player career]]. Do this in each tournament you play in, whoever organised it, and your runs, wickets and catches add up in one player career. Open it from Admin → [[🏆 Open my career]] and share the link on WhatsApp.'),
              ('en','Organisers: if someone claims the wrong name in your tournament, open that player and tap [[Remove claim]]. A player can tap [[Not me]] to undo their own claim. Each name can be claimed by one account only.'),
              ('te','ఆటగాళ్లు తమకంటూ ఉచిత Stumply ఖాతా తెరవవచ్చు. సైన్ ఇన్ చేసి (Google తో అత్యంత వేగం), ఏదైనా టోర్నమెంట్‌లో మీ పేరు తెరిచి (ఆటగాళ్లు, స్కోర్‌కార్డ్ లేదా గణాంకాలు) [[🙋 ఇది నేనే: నా ప్లేయర్ కెరీర్‌లో చేర్చు]] నొక్కండి. మీరు ఆడే ప్రతి టోర్నమెంట్‌లో, ఎవరు నిర్వహించినా ఇలా చేస్తే, మీ పరుగులు, వికెట్లు, క్యాచ్‌లు ఒకే ప్లేయర్ కెరీర్‌లో కలుస్తాయి. అడ్మిన్ → [[🏆 నా కెరీర్ తెరువు]] నుండి తెరిచి లింక్‌ను WhatsApp లో షేర్ చేయండి.'),
              ('te','నిర్వాహకులు: మీ టోర్నమెంట్‌లో ఎవరైనా తప్పు పేరును క్లెయిమ్ చేస్తే, ఆ ఆటగాడిని తెరిచి [[క్లెయిమ్ తీసివేయి]] నొక్కండి. ఆటగాడు తన క్లెయిమ్‌ను [[నేను కాదు]] నొక్కి రద్దు చేయవచ్చు. ఒక పేరును ఒక ఖాతా మాత్రమే క్లెయిమ్ చేయగలదు.')):
    next(x for x in HELP[_l]['sections'] if x[0]=='📊')[3].append(_t)

# Looking for players board (en, te)
for _l,_t in (('en','Short of players, or looking for a game? Tap [[🤝 Looking for players?]] on the first screen, or [[🤝 Open the board]] in Admin. Anyone can read the board without an account. To post, sign in, tap [[➕ Post]], choose team or player, the role, your town and when. Share a WhatsApp number only if you are 18 or older; otherwise write in the details where people can find you. Posts disappear after 30 days, and you can delete yours any time. Tap 🚩 Report on a post that looks wrong.'),
              ('te','ఆటగాళ్లు తక్కువయ్యారా, లేదా ఆట కోసం చూస్తున్నారా? మొదటి స్క్రీన్‌పై [[🤝 ఆటగాళ్ల కోసం వెతుకుతున్నారా?]] లేదా అడ్మిన్‌లో [[🤝 బోర్డు తెరువు]] నొక్కండి. ఖాతా లేకుండానే ఎవరైనా బోర్డు చదవవచ్చు. పోస్ట్ చేయడానికి సైన్ ఇన్ చేసి, [[➕ పోస్ట్ చేయి]] నొక్కి, జట్టు లేదా ఆటగాడు, పాత్ర, మీ ఊరు, ఎప్పుడు అనేవి ఎంచుకోండి. మీకు 18 ఏళ్లు నిండితేనే WhatsApp నంబర్ ఇవ్వండి; లేకపోతే మిమ్మల్ని ఎక్కడ కలవాలో వివరాలలో రాయండి. పోస్ట్‌లు 30 రోజుల తర్వాత మాయమవుతాయి, మీ పోస్ట్‌ను ఎప్పుడైనా తొలగించవచ్చు. తప్పుగా అనిపించే పోస్ట్‌పై 🚩 ఫిర్యాదు నొక్కండి.')):
    next(x for x in HELP[_l]['sections'] if x[0]=='🚀')[3].append(_t)
