// Stumply — Language system and the translation engine (the dictionaries are in i18n-data.js).
// Plain script (not a module): files share globals and load in the order listed in index.html.
// ══════════════════════════════════════════════════════════════════════════
//  LANGUAGE SYSTEM
// ══════════════════════════════════════════════════════════════════════════
const LANGS={
  en:{name:'English',native:'English',flag:'🇬🇧',
    // Nav
    'Home':'🏠 Home','Matches':'📋 Matches','Live':'🔴 Live','Scores':'📊 Scores','History':'🏆 History','Admin':'⚙️ Admin',
    // Auth
    'Sign In':'Sign In','Register':'Register','Logout':'Logout',
    'Username':'Username','Password':'Password','Your Name':'Your Name',
    'Forgot password?':'Forgot password?','Watch as Viewer':'👁 Watch as Viewer',
    'How to Use':'📖 How to Use','Language':'🌐 Language',
    'Create Account':'Create Account →','Sign In →':'Sign In →',
    'Watch Live →':'👁 Watch Live →','Continue →':'Continue →',
    'Reset Password →':'Reset Password →','Import & Sign In →':'📥 Import & Sign In →',
    'Import from another device':'📥 Import from another device',
    'Back to Sign In':'← Back to Sign In',
    'enter username':'your_username','enter password':'••••••••',
    'Security Question':'Security Question','Your Answer':'Your answer (remember this!)',
    // Tournament
    'Tournament Name':'Tournament Name','Edition':'Edition e.g. Season 1',
    'Year':'Year','Overs Format':'Overs Format','Save Tournament':'💾 Save Tournament',
    // Teams
    'Team Name':'Team Name','Team Code':'Code (2-3 letters)','City':'City',
    'Add Team':'✅ Add Team','Clear':'🗑 Clear',
    'Player Name':'Player Name','Jersey #':'Jersey #','Role':'Role',
    // Matches
    'Schedule Match':'📅 Schedule Match','+ Schedule':'+ Schedule',
    'Match Stage':'Match Stage','Venue':'Venue','Date':'Date',
    'Umpires':'Umpires','Start':'▶ Start','Edit':'✏️ Edit','Delete':'Delete',
    'Team A':'Team A Playing XI','Team B':'Team B Playing XI',
    // Live scoring
    'DOT':'DOT','WIDE':'WIDE','NO BALL':'NO BALL','BYE':'BYE','LEG BYE':'LEG BYE',
    'WICKET':'⚡ WICKET','Manage':'⚙️ Manage Players / Bowler',
    'Retired Hurt':'🚑 Retired Hurt','Ball-by-Ball':'🎯 Ball-by-Ball Entry',
    'ON STRIKE':'★ ON STRIKE','non-striker':'(non-striker)','Bowling':'(Bowling)',
    'THIS OVER:':'THIS OVER:','Actions:':'⚡ Actions:',
    'Target:':'🎯 Target:','Need:':'Need:','CRR:':'CRR:','RRR:':'RRR:',
    'P-ship:':'P-ship:','FoW:':'FoW:',
    // Toss/Setup
    'Toss Won By':'Toss Won By','Decision':'Decision',
    'Bat':'Bat','Bowl':'Bowl','Confirm Toss':'✅ Confirm Toss',
    'Batting Team':'Batting Team','Bowling Team':'Bowling Team',
    'Select Opener 1':'Select Opener 1','Select Opener 2':'Select Opener 2',
    'Opening Bowler':'Opening Bowler','Start Innings':'▶ Start Innings',
    'Select Bowler':'Select New Bowler','Confirm Over':'✅ Confirm Over',
    // Wicket
    'Dismissal Type':'Dismissal Type','Next Batsman':'Next Batsman',
    'Fielder Name':'Fielder Name (optional)','Confirm Wicket':'✅ Confirm Wicket',
    // Manage
    'Set Striker':'Set Striker','Set Non-Striker':'Set Non-Striker',
    'Change Bowler':'Change Bowler','Apply':'✅ Apply',
    // History/Stats
    'Completed Matches':'Completed Matches','Points Table':'Points Table',
    'Batting':'🏏 Batting','Bowling':'🎳 Bowling','Fielding':'🧤 Fielding','Awards':'🏅 Awards',
    'Player (batting)':'Player','M':'M','Inn':'Inn','Runs':'Runs','Balls':'Balls',
    'Avg':'Avg','SR':'SR','HS':'HS','100s':'100s','50s':'50s','6s':'6s','4s':'4s','Ducks':'Ducks','NO':'NO',
    'Wkts':'Wkts','Best':'Best','Eco':'Eco','Mdns':'Mdns','Wds':'Wds','NBs':'NBs',
    'Catches':'Catches','Stumpings':'Stumpings','Run Outs':'Run Outs','Total':'Total',
    'Tournament Champion':'🏆 TOURNAMENT CHAMPION','Orange Cap':'🟠 Orange Cap — Most Runs',
    'Purple Cap':'🟣 Purple Cap — Most Wickets','Man of the Match':'🏅 Man of the Match',
    'Match Awards':'🏅 Match Awards','Save Awards':'💾 Save Awards','Skip':'Skip',
    // Admin
    'Tournament Details':'🏆 Tournament Details','Add Teams':'➕ Add Teams',
    'Manage Players':'👤 Manage Players','Share Link':'🔗 Share Link',
    'Export Account':'📤 Export Account','Import Account':'📥 Import Account',
    'Copy Link':'📋 Copy Link','Open Link':'🔗 Open',
    'Copy Code':'📋 Copy Code',
    // Misc
    'Player':'Player','Umpire':'Umpire','Cancel':'Cancel','Close':'✕ Close',
    'Save':'Save','Confirm':'Confirm','No Result':'No Result',
    'Language selected':'selected',
  },

  te:{name:'Telugu',native:'తెలుగు',flag:'🇮🇳',
    'Home':'🏠 హోమ్','Matches':'📋 మ్యాచ్‌లు','Live':'🔴 లైవ్','Scores':'📊 స్కోర్లు','History':'🏆 చరిత్ర','Admin':'⚙️ అడ్మిన్',
    'Sign In':'సైన్ ఇన్','Register':'నమోదు','Logout':'నిష్క్రమించు',
    'Username':'వాడుకరి పేరు','Password':'పాస్‌వర్డ్','Your Name':'మీ పేరు',
    'Forgot password?':'పాస్‌వర్డ్ మర్చిపోయారా?','Watch as Viewer':'👁 వీక్షకుడిగా చూడు',
    'How to Use':'📖 ఎలా వాడాలి','Language':'🌐 భాష',
    'Create Account':'ఖాతా సృష్టించు →','Sign In →':'సైన్ ఇన్ →',
    'Watch Live →':'👁 లైవ్ చూడు →','Continue →':'కొనసాగు →',
    'Reset Password →':'పాస్‌వర్డ్ రీసెట్ →','Import & Sign In →':'📥 దిగుమతి & సైన్ ఇన్ →',
    'Import from another device':'📥 మరో డివైస్ నుండి దిగుమతి',
    'Back to Sign In':'← సైన్ ఇన్‌కు తిరిగి',
    'enter username':'మీ_వాడుకరి_పేరు','enter password':'••••••••',
    'Security Question':'భద్రతా ప్రశ్న','Your Answer':'మీ సమాధానం',
    'Tournament Name':'టోర్నమెంట్ పేరు','Edition':'ఎడిషన్ ఉదా. సీజన్ 1',
    'Year':'సంవత్సరం','Overs Format':'ఓవర్ ఫార్మాట్','Save Tournament':'💾 సేవ్ చేయి',
    'Team Name':'జట్టు పేరు','Team Code':'కోడ్ (2-3 అక్షరాలు)','City':'నగరం',
    'Add Team':'✅ జట్టు చేర్చు','Clear':'🗑 తొలగించు',
    'Player Name':'ఆటగాడు పేరు','Jersey #':'జెర్సీ నం.','Role':'పాత్ర',
    'Schedule Match':'📅 మ్యాచ్ షెడ్యూల్','+ Schedule':'+ షెడ్యూల్',
    'Match Stage':'మ్యాచ్ దశ','Venue':'మైదానం','Date':'తేదీ',
    'Umpires':'అంపైర్లు','Start':'▶ ప్రారంభించు','Edit':'✏️ మార్చు','Delete':'తొలగించు',
    'Team A':'జట్టు A ఆడే XI','Team B':'జట్టు B ఆడే XI',
    'DOT':'డాట్','WIDE':'వైడ్','NO BALL':'నో బాల్','BYE':'బై','LEG BYE':'లెగ్ బై',
    'WICKET':'⚡ వికెట్','Manage':'⚙️ ఆటగాళ్ళను నిర్వహించు',
    'Retired Hurt':'🚑 గాయపడి విరమించు','Ball-by-Ball':'🎯 బాల్-బై-బాల్ నమోదు',
    'ON STRIKE':'★ స్ట్రైక్‌లో','non-striker':'(నాన్-స్ట్రైకర్)','Bowling':'(బౌలింగ్)',
    'THIS OVER:':'ఈ ఓవర్:','Actions:':'⚡ చర్యలు:',
    'Target:':'🎯 లక్ష్యం:','Need:':'కావాలి:','CRR:':'ప్రస్తుత రన్‌రేట్:','RRR:':'అవసరమైన రేట్:',
    'P-ship:':'భాగస్వామ్యం:','FoW:':'వికెట్ పతనం:',
    'Toss Won By':'టాస్ గెలిచినది','Decision':'నిర్ణయం',
    'Bat':'బ్యాటింగ్','Bowl':'బౌలింగ్','Confirm Toss':'✅ టాస్ నిర్ధారించు',
    'Batting Team':'బ్యాటింగ్ జట్టు','Bowling Team':'బౌలింగ్ జట్టు',
    'Select Opener 1':'ఓపెనర్ 1 ఎంచుకో','Select Opener 2':'ఓపెనర్ 2 ఎంచుకో',
    'Opening Bowler':'ప్రారంభ బౌలర్','Start Innings':'▶ ఇన్నింగ్స్ ప్రారంభించు',
    'Select Bowler':'కొత్త బౌలర్ ఎంచుకో','Confirm Over':'✅ ఓవర్ నిర్ధారించు',
    'Dismissal Type':'విఫలమైన విధానం','Next Batsman':'తదుపరి బ్యాట్స్‌మన్',
    'Fielder Name':'ఫీల్డర్ పేరు (ఐచ్ఛికం)','Confirm Wicket':'✅ వికెట్ నిర్ధారించు',
    'Set Striker':'స్ట్రైకర్ సెట్ చేయి','Set Non-Striker':'నాన్-స్ట్రైకర్ సెట్ చేయి',
    'Change Bowler':'బౌలర్ మార్చు','Apply':'✅ వర్తింపజేయి',
    'Completed Matches':'పూర్తయిన మ్యాచ్‌లు','Points Table':'పాయింట్ల పట్టిక',
    'Batting':'🏏 బ్యాటింగ్','Bowling':'🎳 బౌలింగ్','Fielding':'🧤 ఫీల్డింగ్','Awards':'🏅 అవార్డులు',
    'Player (batting)':'ఆటగాడు','M':'మ్యా','Inn':'ఇన్','Runs':'పరుగులు','Balls':'బంతులు',
    'Avg':'సగటు','SR':'స్ట్రైక్ రేట్','HS':'అత్యధిక స్కోర్','100s':'శతకాలు','50s':'అర్ధ శతకాలు','6s':'సిక్సర్లు','4s':'ఫోర్లు','Ducks':'డక్‌లు','NO':'నాటౌట్',
    'Wkts':'వికెట్లు','Best':'అత్యుత్తమ','Eco':'ఎకానమీ','Mdns':'మెయిడన్లు','Wds':'వైడ్లు','NBs':'నో బాల్లు',
    'Catches':'క్యాచ్‌లు','Stumpings':'స్టంపింగ్లు','Run Outs':'రన్ అవుట్లు','Total':'మొత్తం',
    'Tournament Champion':'🏆 టోర్నమెంట్ విజేత','Orange Cap':'🟠 ఆరంజ్ క్యాప్ — అత్యధిక పరుగులు',
    'Purple Cap':'🟣 పర్పుల్ క్యాప్ — అత్యధిక వికెట్లు','Man of the Match':'🏅 మ్యాచ్ హీరో',
    'Match Awards':'🏅 మ్యాచ్ అవార్డులు','Save Awards':'💾 అవార్డులు సేవ్ చేయి','Skip':'దాటవేయి',
    'Tournament Details':'🏆 టోర్నమెంట్ వివరాలు','Add Teams':'➕ జట్లను చేర్చు',
    'Manage Players':'👤 ఆటగాళ్ళను నిర్వహించు','Share Link':'🔗 షేర్ లింక్',
    'Export Account':'📤 ఖాతా ఎగుమతి','Import Account':'📥 ఖాతా దిగుమతి',
    'Copy Link':'📋 లింక్ కాపీ చేయి','Open Link':'🔗 తెరువు','Copy Code':'📋 కోడ్ కాపీ చేయి',
    'Player':'ఆటగాడు','Umpire':'అంపైర్','Cancel':'రద్దు చేయి','Close':'✕ మూసివేయి',
    'Save':'సేవ్ చేయి','Confirm':'నిర్ధారించు','No Result':'ఫలితం లేదు',
    'Language selected':'ఎంచుకోబడింది',
  },

  ta:{name:'Tamil',native:'தமிழ்',flag:'🇮🇳',
    'Home':'🏠 முகப்பு','Matches':'📋 போட்டிகள்','Live':'🔴 நேரலை','Scores':'📊 மதிப்பெண்கள்','History':'🏆 வரலாறு','Admin':'⚙️ நிர்வாகி',
    'Sign In':'உள்நுழை','Register':'பதிவு','Logout':'வெளியேறு',
    'Username':'பயனர் பெயர்','Password':'கடவுச்சொல்','Your Name':'உங்கள் பெயர்',
    'Forgot password?':'கடவுச்சொல் மறந்தீர்களா?','Watch as Viewer':'👁 பார்வையாளராக',
    'How to Use':'📖 பயன்படுத்துவது எப்படி','Language':'🌐 மொழி',
    'Create Account':'கணக்கு உருவாக்கு →','Sign In →':'உள்நுழை →',
    'Watch Live →':'👁 நேரலை பார் →','Continue →':'தொடர் →',
    'Reset Password →':'கடவுச்சொல் மீட்டமை →','Import & Sign In →':'📥 இறக்கு & உள்நுழை →',
    'Import from another device':'📥 மற்றொரு சாதனத்திலிருந்து இறக்கு',
    'Back to Sign In':'← உள்நுழைவுக்கு திரும்பு',
    'enter username':'பயனர்_பெயர்','enter password':'••••••••',
    'Security Question':'பாதுகாப்பு கேள்வி','Your Answer':'உங்கள் பதில்',
    'Tournament Name':'போட்டி பெயர்','Edition':'பதிப்பு எ.கா. சீசன் 1',
    'Year':'ஆண்டு','Overs Format':'ஓவர் வடிவம்','Save Tournament':'💾 சேமி',
    'Team Name':'அணி பெயர்','Team Code':'குறியீடு (2-3 எழுத்துகள்)','City':'நகரம்',
    'Add Team':'✅ அணி சேர்','Clear':'🗑 அழி',
    'Player Name':'வீரர் பெயர்','Jersey #':'ஜெர்சி எண்','Role':'பாத்திரம்',
    'Schedule Match':'📅 போட்டி அட்டவணை','+ Schedule':'+ அட்டவணை',
    'Match Stage':'போட்டி கட்டம்','Venue':'இடம்','Date':'தேதி',
    'Umpires':'நடுவர்கள்','Start':'▶ தொடங்கு','Edit':'✏️ திருத்து','Delete':'நீக்கு',
    'Team A':'அணி A விளையாடும் XI','Team B':'அணி B விளையாடும் XI',
    'DOT':'டாட்','WIDE':'வைட்','NO BALL':'நோ பால்','BYE':'பை','LEG BYE':'லெக் பை',
    'WICKET':'⚡ விக்கெட்','Manage':'⚙️ வீரர்களை நிர்வகி',
    'Retired Hurt':'🚑 காயத்துடன் விலகு','Ball-by-Ball':'🎯 பந்து-பந்து நமோது',
    'ON STRIKE':'★ ஸ்ட்ரைக்கில்','non-striker':'(நான்-ஸ்ட்ரைக்கர்)','Bowling':'(பந்துவீச்சு)',
    'THIS OVER:':'இந்த ஓவர்:','Actions:':'⚡ செயல்கள்:',
    'Target:':'🎯 இலக்கு:','Need:':'தேவை:','CRR:':'தற்போதைய RR:','RRR:':'தேவையான RR:',
    'P-ship:':'கூட்டணி:','FoW:':'விக்கெட் வீழ்ச்சி:',
    'Toss Won By':'நாணயம் வென்றது','Decision':'முடிவு',
    'Bat':'பேட்டிங்','Bowl':'பந்துவீச்சு','Confirm Toss':'✅ நாணயம் உறுதி செய்',
    'Batting Team':'பேட்டிங் அணி','Bowling Team':'பந்துவீச்சு அணி',
    'Select Opener 1':'ஓபனர் 1 தேர்வு','Select Opener 2':'ஓபனர் 2 தேர்வு',
    'Opening Bowler':'தொடக்க பந்துவீச்சாளர்','Start Innings':'▶ இன்னிங்ஸ் தொடங்கு',
    'Select Bowler':'புதிய பந்துவீச்சாளர் தேர்வு','Confirm Over':'✅ ஓவர் உறுதி செய்',
    'Dismissal Type':'வெளியேற்றும் முறை','Next Batsman':'அடுத்த வீரர்',
    'Fielder Name':'வயல் வீரர் பெயர்','Confirm Wicket':'✅ விக்கெட் உறுதி செய்',
    'Set Striker':'ஸ்ட்ரைக்கர் அமை','Set Non-Striker':'நான்-ஸ்ட்ரைக்கர் அமை',
    'Change Bowler':'பந்துவீச்சாளர் மாற்று','Apply':'✅ பயன்படுத்து',
    'Completed Matches':'முடிந்த போட்டிகள்','Points Table':'புள்ளி அட்டவணை',
    'Batting':'🏏 பேட்டிங்','Bowling':'🎳 பந்துவீச்சு','Fielding':'🧤 வயல்','Awards':'🏅 விருதுகள்',
    'Player (batting)':'வீரர்','M':'ம','Inn':'இன்','Runs':'ஓட்டங்கள்','Balls':'பந்துகள்',
    'Avg':'சராசரி','SR':'ஸ்ட்ரைக் ரேட்','HS':'உயர் மதிப்பெண்','100s':'சதங்கள்','50s':'அரை சதங்கள்','6s':'சிக்சர்கள்','4s':'நான்கு','Ducks':'டக்குகள்','NO':'நாட் அவுட்',
    'Wkts':'விக்கெட்கள்','Best':'சிறந்த','Eco':'பொருளாதாரம்','Mdns':'மெய்டன்கள்','Wds':'வைட்கள்','NBs':'நோ பால்கள்',
    'Catches':'கேட்ச்கள்','Stumpings':'ஸ்டம்பிங்கள்','Run Outs':'ரன் அவுட்கள்','Total':'மொத்தம்',
    'Tournament Champion':'🏆 போட்டி சாம்பியன்','Orange Cap':'🟠 ஆரஞ்சு தொப்பி','Purple Cap':'🟣 ஊதா தொப்பி',
    'Man of the Match':'🏅 போட்டியின் சிறந்த வீரர்',
    'Match Awards':'🏅 போட்டி விருதுகள்','Save Awards':'💾 விருதுகள் சேமி','Skip':'தவிர்',
    'Tournament Details':'🏆 போட்டி விவரங்கள்','Add Teams':'➕ அணிகளை சேர்',
    'Manage Players':'👤 வீரர்களை நிர்வகி','Share Link':'🔗 பகிர் இணைப்பு',
    'Export Account':'📤 கணக்கு ஏற்றுமதி','Import Account':'📥 கணக்கு இறக்குமதி',
    'Copy Link':'📋 இணைப்பு நகல்','Open Link':'🔗 திற','Copy Code':'📋 குறியீடு நகல்',
    'Player':'வீரர்','Umpire':'நடுவர்','Cancel':'ரத்து','Close':'✕ மூடு',
    'Save':'சேமி','Confirm':'உறுதி','No Result':'முடிவு இல்லை',
    'Language selected':'தேர்ந்தெடுக்கப்பட்டது',
  },

  kn:{name:'Kannada',native:'ಕನ್ನಡ',flag:'🇮🇳',
    'Home':'🏠 ಮುಖ್ಯ','Matches':'📋 ಪಂದ್ಯಗಳು','Live':'🔴 ನೇರ','Scores':'📊 ಸ್ಕೋರ್‌ಗಳು','History':'🏆 ಇತಿಹಾಸ','Admin':'⚙️ ಆಡಳಿತ',
    'Sign In':'ಸೈನ್ ಇನ್','Register':'ನೋಂದಣಿ','Logout':'ಲಾಗ್ ಔಟ್',
    'Username':'ಬಳಕೆದಾರ ಹೆಸರು','Password':'ಪಾಸ್‌ವರ್ಡ್','Your Name':'ನಿಮ್ಮ ಹೆಸರು',
    'Forgot password?':'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿದ್ದೀರಾ?','Watch as Viewer':'👁 ವೀಕ್ಷಕರಾಗಿ',
    'How to Use':'📖 ಹೇಗೆ ಬಳಸಬೇಕು','Language':'🌐 ಭಾಷೆ',
    'Create Account':'ಖಾತೆ ರಚಿಸಿ →','Sign In →':'ಸೈನ್ ಇನ್ →',
    'Watch Live →':'👁 ನೇರ ನೋಡಿ →','Continue →':'ಮುಂದುವರಿ →',
    'Reset Password →':'ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ →','Import & Sign In →':'📥 ಆಮದು & ಸೈನ್ ಇನ್ →',
    'Import from another device':'📥 ಇನ್ನೊಂದು ಸಾಧನದಿಂದ ಆಮದು',
    'Back to Sign In':'← ಸೈನ್ ಇನ್‌ಗೆ ಹಿಂತಿರುಗಿ',
    'enter username':'ಬಳಕೆದಾರ_ಹೆಸರು','enter password':'••••••••',
    'Security Question':'ಭದ್ರತಾ ಪ್ರಶ್ನೆ','Your Answer':'ನಿಮ್ಮ ಉತ್ತರ',
    'Tournament Name':'ಟೂರ್ನಮೆಂಟ್ ಹೆಸರು','Edition':'ಆವೃತ್ತಿ','Year':'ವರ್ಷ',
    'Overs Format':'ಓವರ್ ಸ್ವರೂಪ','Save Tournament':'💾 ಉಳಿಸಿ',
    'Team Name':'ತಂಡದ ಹೆಸರು','Team Code':'ಕೋಡ್ (2-3 ಅಕ್ಷರಗಳು)','City':'ನಗರ',
    'Add Team':'✅ ತಂಡ ಸೇರಿಸು','Clear':'🗑 ಅಳಿಸಿ',
    'Player Name':'ಆಟಗಾರ ಹೆಸರು','Jersey #':'ಜೆರ್ಸಿ ಸಂ.','Role':'ಪಾತ್ರ',
    'Schedule Match':'📅 ಪಂದ್ಯ ವೇಳಾಪಟ್ಟಿ','+ Schedule':'+ ವೇಳಾಪಟ್ಟಿ',
    'Match Stage':'ಪಂದ್ಯ ಹಂತ','Venue':'ಸ್ಥಳ','Date':'ದಿನಾಂಕ',
    'Umpires':'ಅಂಪೈರ್‌ಗಳು','Start':'▶ ಪ್ರಾರಂಭಿಸಿ','Edit':'✏️ ಸಂಪಾದಿಸಿ','Delete':'ಅಳಿಸಿ',
    'Team A':'ತಂಡ A ಆಡುವ XI','Team B':'ತಂಡ B ಆಡುವ XI',
    'DOT':'ಡಾಟ್','WIDE':'ವೈಡ್','NO BALL':'ನೋ ಬಾಲ್','BYE':'ಬೈ','LEG BYE':'ಲೆಗ್ ಬೈ',
    'WICKET':'⚡ ವಿಕೆಟ್','Manage':'⚙️ ಆಟಗಾರರನ್ನು ನಿರ್ವಹಿಸಿ',
    'Retired Hurt':'🚑 ಗಾಯಗೊಂಡು ನಿವೃತ್ತಿ','Ball-by-Ball':'🎯 ಚೆಂಡು-ಚೆಂಡು ದಾಖಲು',
    'ON STRIKE':'★ ಸ್ಟ್ರೈಕ್‌ನಲ್ಲಿ','non-striker':'(ನಾನ್-ಸ್ಟ್ರೈಕರ್)','Bowling':'(ಬೌಲಿಂಗ್)',
    'THIS OVER:':'ಈ ಓವರ್:','Actions:':'⚡ ಕ್ರಿಯೆಗಳು:',
    'Target:':'🎯 ಗುರಿ:','Need:':'ಬೇಕು:','CRR:':'ಪ್ರಸ್ತುತ RR:','RRR:':'ಅಗತ್ಯ RR:',
    'P-ship:':'ಜೋಡಿ:','FoW:':'ವಿಕೆಟ್ ಪತನ:',
    'Toss Won By':'ಟಾಸ್ ಗೆದ್ದವರು','Decision':'ನಿರ್ಧಾರ',
    'Bat':'ಬ್ಯಾಟಿಂಗ್','Bowl':'ಬೌಲಿಂಗ್','Confirm Toss':'✅ ಟಾಸ್ ಖಚಿತಪಡಿಸಿ',
    'Batting Team':'ಬ್ಯಾಟಿಂಗ್ ತಂಡ','Bowling Team':'ಬೌಲಿಂಗ್ ತಂಡ',
    'Select Opener 1':'ಓಪನರ್ 1 ಆಯ್ಕೆ','Select Opener 2':'ಓಪನರ್ 2 ಆಯ್ಕೆ',
    'Opening Bowler':'ಆರಂಭಿಕ ಬೌಲರ್','Start Innings':'▶ ಇನ್ನಿಂಗ್ಸ್ ಪ್ರಾರಂಭಿಸಿ',
    'Select Bowler':'ಹೊಸ ಬೌಲರ್ ಆಯ್ಕೆ','Confirm Over':'✅ ಓವರ್ ಖಚಿತಪಡಿಸಿ',
    'Dismissal Type':'ಔಟ್ ವಿಧಾನ','Next Batsman':'ಮುಂದಿನ ಬ್ಯಾಟ್ಸ್‌ಮನ್',
    'Fielder Name':'ಕ್ಷೇತ್ರ ಆಟಗಾರ ಹೆಸರು','Confirm Wicket':'✅ ವಿಕೆಟ್ ಖಚಿತಪಡಿಸಿ',
    'Set Striker':'ಸ್ಟ್ರೈಕರ್ ಹೊಂದಿಸಿ','Set Non-Striker':'ನಾನ್-ಸ್ಟ್ರೈಕರ್ ಹೊಂದಿಸಿ',
    'Change Bowler':'ಬೌಲರ್ ಬದಲಿಸಿ','Apply':'✅ ಅನ್ವಯಿಸಿ',
    'Completed Matches':'ಮುಗಿದ ಪಂದ್ಯಗಳು','Points Table':'ಅಂಕ ಪಟ್ಟಿ',
    'Batting':'🏏 ಬ್ಯಾಟಿಂಗ್','Bowling':'🎳 ಬೌಲಿಂಗ್','Fielding':'🧤 ಕ್ಷೇತ್ರ','Awards':'🏅 ಪ್ರಶಸ್ತಿಗಳು',
    'Player (batting)':'ಆಟಗಾರ','M':'ಪ','Inn':'ಇನ್','Runs':'ರನ್ಗಳು','Balls':'ಎಸೆತಗಳು',
    'Avg':'ಸರಾಸರಿ','SR':'ಸ್ಟ್ರೈಕ್ ರೇಟ್','HS':'ಅತ್ಯಧಿಕ','100s':'ಶತಕಗಳು','50s':'ಅರ್ಧ ಶತಕಗಳು','6s':'ಸಿಕ್ಸರ್‌ಗಳು','4s':'ಫೋರ್‌ಗಳು','Ducks':'ಡಕ್‌ಗಳು','NO':'ನಾಟ್ ಔಟ್',
    'Wkts':'ವಿಕೆಟ್‌ಗಳು','Best':'ಅತ್ಯುತ್ತಮ','Eco':'ಎಕಾನಮಿ','Mdns':'ಮೇಡನ್‌ಗಳು','Wds':'ವೈಡ್‌ಗಳು','NBs':'ನೋ ಬಾಲ್‌ಗಳು',
    'Catches':'ಕ್ಯಾಚ್‌ಗಳು','Stumpings':'ಸ್ಟಂಪಿಂಗ್‌ಗಳು','Run Outs':'ರನ್ ಔಟ್‌ಗಳು','Total':'ಒಟ್ಟು',
    'Tournament Champion':'🏆 ಟೂರ್ನಮೆಂಟ್ ವಿಜೇತ','Orange Cap':'🟠 ಆರೆಂಜ್ ಕ್ಯಾಪ್','Purple Cap':'🟣 ಪರ್ಪಲ್ ಕ್ಯಾಪ್',
    'Man of the Match':'🏅 ಪಂದ್ಯದ ಅತ್ಯುತ್ತಮ ಆಟಗಾರ',
    'Match Awards':'🏅 ಪಂದ್ಯ ಪ್ರಶಸ್ತಿಗಳು','Save Awards':'💾 ಪ್ರಶಸ್ತಿಗಳು ಉಳಿಸಿ','Skip':'ಬಿಡಿ',
    'Tournament Details':'🏆 ಟೂರ್ನಮೆಂಟ್ ವಿವರಗಳು','Add Teams':'➕ ತಂಡಗಳನ್ನು ಸೇರಿಸಿ',
    'Manage Players':'👤 ಆಟಗಾರರನ್ನು ನಿರ್ವಹಿಸಿ','Share Link':'🔗 ಷೇರ್ ಲಿಂಕ್',
    'Export Account':'📤 ಖಾತೆ ರಫ್ತು','Import Account':'📥 ಖಾತೆ ಆಮದು',
    'Copy Link':'📋 ಲಿಂಕ್ ನಕಲು','Open Link':'🔗 ತೆರೆ','Copy Code':'📋 ಕೋಡ್ ನಕಲು',
    'Player':'ಆಟಗಾರ','Umpire':'ಅಂಪೈರ್','Cancel':'ರದ್ದು','Close':'✕ ಮುಚ್ಚಿ',
    'Save':'ಉಳಿಸಿ','Confirm':'ಖಚಿತಪಡಿಸಿ','No Result':'ಫಲಿತಾಂಶ ಇಲ್ಲ',
    'Language selected':'ಆಯ್ಕೆಯಾಗಿದೆ',
  },

  ml:{name:'Malayalam',native:'മലയാളം',flag:'🇮🇳',
    'Home':'🏠 ഹോം','Matches':'📋 മത്സരങ്ങൾ','Live':'🔴 തൽസമയം','Scores':'📊 സ്കോറുകൾ','History':'🏆 ചരിത്രം','Admin':'⚙️ അഡ്മിൻ',
    'Sign In':'സൈൻ ഇൻ','Register':'രജിസ്റ്റർ','Logout':'ലോഗൗട്ട്',
    'Username':'ഉപയോക്തൃ നാമം','Password':'പാസ്‌വേഡ്','Your Name':'നിങ്ങളുടെ പേര്',
    'Forgot password?':'പാസ്‌വേഡ് മറന്നോ?','Watch as Viewer':'👁 കാഴ്ചക്കാരനായി',
    'How to Use':'📖 എങ്ങനെ ഉപയോഗിക്കാം','Language':'🌐 ഭാഷ',
    'Create Account':'അക്കൗണ്ട് ഉണ്ടാക്കുക →','Sign In →':'സൈൻ ഇൻ →',
    'Watch Live →':'👁 തൽസമയം കാണുക →','Continue →':'തുടരുക →',
    'Reset Password →':'പാസ്‌വേഡ് പുനഃസജ്ജമാക്കുക →','Import & Sign In →':'📥 ഇറക്കുമതി & സൈൻ ഇൻ →',
    'Import from another device':'📥 മറ്റൊരു ഉപകരണത്തിൽ നിന്ന് ഇറക്കുമതി',
    'Back to Sign In':'← സൈൻ ഇൻ ലേക്ക് തിരിച്ചു',
    'enter username':'ഉപയോക്തൃ_നാമം','enter password':'••••••••',
    'Security Question':'സുരക്ഷാ ചോദ്യം','Your Answer':'നിങ്ങളുടെ ഉത്തരം',
    'Tournament Name':'ടൂർണമെന്റ് നാമം','Edition':'എഡിഷൻ','Year':'വർഷം',
    'Overs Format':'ഓവർ ഫോർമാറ്റ്','Save Tournament':'💾 സേവ് ചെയ്യുക',
    'Team Name':'ടീം നാമം','Team Code':'കോഡ് (2-3 അക്ഷരങ്ങൾ)','City':'നഗരം',
    'Add Team':'✅ ടീം ചേർക്കുക','Clear':'🗑 മായ്ക്കുക',
    'Player Name':'കളിക്കാരന്റെ പേര്','Jersey #':'ജഴ്സി നം.','Role':'ദൗത്യം',
    'Schedule Match':'📅 മത്സരം ഷെഡ്യൂൾ','+ Schedule':'+ ഷെഡ്യൂൾ',
    'Match Stage':'മത്സരഘട്ടം','Venue':'സ്ഥലം','Date':'തീയതി',
    'Umpires':'അമ്പയർമാർ','Start':'▶ ആരംഭിക്കുക','Edit':'✏️ തിരുത്തുക','Delete':'ഇല്ലാക്കുക',
    'Team A':'ടീം A കളിക്കുന്ന XI','Team B':'ടീം B കളിക്കുന്ന XI',
    'DOT':'ഡോട്ട്','WIDE':'വൈഡ്','NO BALL':'നോ ബോൾ','BYE':'ബൈ','LEG BYE':'ലെഗ് ബൈ',
    'WICKET':'⚡ വിക്കറ്റ്','Manage':'⚙️ കളിക്കാരെ നിയന്ത്രിക്കുക',
    'Retired Hurt':'🚑 പരിക്കോടെ വിരമിക്കുക','Ball-by-Ball':'🎯 പന്ത്-വഴി-പന്ത് രേഖ',
    'ON STRIKE':'★ സ്ട്രൈക്കിൽ','non-striker':'(നോൺ-സ്ട്രൈക്കർ)','Bowling':'(ബൗളിംഗ്)',
    'THIS OVER:':'ഈ ഓവർ:','Actions:':'⚡ പ്രവൃത്തികൾ:',
    'Target:':'🎯 ലക്ഷ്യം:','Need:':'വേണം:','CRR:':'നിലവിൽ RR:','RRR:':'ആവശ്യ RR:',
    'P-ship:':'പങ്കാളിത്തം:','FoW:':'വിക്കറ്റ് പതനം:',
    'Toss Won By':'ടോസ് നേടിയത്','Decision':'തീരുമാനം',
    'Bat':'ബാറ്റിംഗ്','Bowl':'ബൗളിംഗ്','Confirm Toss':'✅ ടോസ് സ്ഥിരീകരിക്കുക',
    'Batting Team':'ബാറ്റിംഗ് ടീം','Bowling Team':'ബൗളിംഗ് ടീം',
    'Select Opener 1':'ഓപ്പണർ 1 തിരഞ്ഞെടുക്കുക','Select Opener 2':'ഓപ്പണർ 2 തിരഞ്ഞെടുക്കുക',
    'Opening Bowler':'ആദ്യ ബൗളർ','Start Innings':'▶ ഇന്നിംഗ്സ് ആരംഭിക്കുക',
    'Select Bowler':'പുതിയ ബൗളർ','Confirm Over':'✅ ഓവർ സ്ഥിരീകരിക്കുക',
    'Dismissal Type':'ഔട്ട് രീതി','Next Batsman':'അടുത്ത ബാറ്റ്സ്മൻ',
    'Fielder Name':'ഫീൽഡർ പേര്','Confirm Wicket':'✅ വിക്കറ്റ് സ്ഥിരീകരിക്കുക',
    'Set Striker':'സ്ട്രൈക്കർ സജ്ജമാക്കുക','Set Non-Striker':'നോൺ-സ്ട്രൈക്കർ സജ്ജമാക്കുക',
    'Change Bowler':'ബൗളർ മാറ്റുക','Apply':'✅ പ്രയോഗിക്കുക',
    'Completed Matches':'പൂർത്തിയായ മത്സരങ്ങൾ','Points Table':'പോയിന്റ് പട്ടിക',
    'Batting':'🏏 ബാറ്റിംഗ്','Bowling':'🎳 ബൗളിംഗ്','Fielding':'🧤 ഫീൽഡിംഗ്','Awards':'🏅 അവാർഡുകൾ',
    'Player (batting)':'കളിക്കാരൻ','M':'മ','Inn':'ഇൻ','Runs':'റൺസ്','Balls':'പന്തുകൾ',
    'Avg':'ശരാശരി','SR':'സ്ട്രൈക്ക് റേറ്റ്','HS':'ഉയർന്ന','100s':'സെഞ്ചുറികൾ','50s':'അർദ്ധ സെഞ്ചുറികൾ','6s':'സിക്സറുകൾ','4s':'ഫോറുകൾ','Ducks':'ഡക്കുകൾ','NO':'നോട്ടൗട്ട്',
    'Wkts':'വിക്കറ്റുകൾ','Best':'മികച്ചത്','Eco':'ഇക്കണോമി','Mdns':'മെയ്ഡൻ','Wds':'വൈഡുകൾ','NBs':'നോ ബോളുകൾ',
    'Catches':'ക്യാച്ചുകൾ','Stumpings':'സ്റ്റംപിംഗ്','Run Outs':'റൺ ഔട്ടുകൾ','Total':'ആകെ',
    'Tournament Champion':'🏆 ടൂർണമെന്റ് ചാമ്പ്യൻ','Orange Cap':'🟠 ഓറഞ്ച് ക്യാപ്','Purple Cap':'🟣 പർപ്പിൾ ക്യാപ്',
    'Man of the Match':'🏅 മത്സരത്തിലെ മികച്ച കളിക്കാരൻ',
    'Match Awards':'🏅 മത്സര അവാർഡുകൾ','Save Awards':'💾 അവാർഡുകൾ സേവ്','Skip':'ഒഴിവാക്കുക',
    'Tournament Details':'🏆 ടൂർണമെന്റ് വിവരങ്ങൾ','Add Teams':'➕ ടീമുകൾ ചേർക്കുക',
    'Manage Players':'👤 കളിക്കാരെ നിയന്ത്രിക്കുക','Share Link':'🔗 ഷെയർ ലിങ്ക്',
    'Export Account':'📤 അക്കൗണ്ട് എക്സ്പോർട്ട്','Import Account':'📥 അക്കൗണ്ട് ഇംപോർട്ട്',
    'Copy Link':'📋 ലിങ്ക് കോപ്പി','Open Link':'🔗 തുറക്കുക','Copy Code':'📋 കോഡ് കോപ്പി',
    'Player':'കളിക്കാരൻ','Umpire':'അമ്പയർ','Cancel':'റദ്ദാക്കുക','Close':'✕ അടയ്ക്കുക',
    'Save':'സേവ്','Confirm':'സ്ഥിരീകരിക്കുക','No Result':'ഫലമില്ല',
    'Language selected':'തിരഞ്ഞെടുത്തു',
  },

  hi:{name:'Hindi',native:'हिन्दी',flag:'🇮🇳',
    'Home':'🏠 होम','Matches':'📋 मैच','Live':'🔴 लाइव','Scores':'📊 स्कोर','History':'🏆 इतिहास','Admin':'⚙️ एडमिन',
    'Sign In':'साइन इन','Register':'रजिस्टर','Logout':'लॉग आउट',
    'Username':'उपयोगकर्ता नाम','Password':'पासवर्ड','Your Name':'आपका नाम',
    'Forgot password?':'पासवर्ड भूल गए?','Watch as Viewer':'👁 दर्शक के रूप में',
    'How to Use':'📖 कैसे उपयोग करें','Language':'🌐 भाषा',
    'Create Account':'खाता बनाएं →','Sign In →':'साइन इन →',
    'Watch Live →':'👁 लाइव देखें →','Continue →':'जारी रखें →',
    'Reset Password →':'पासवर्ड रीसेट →','Import & Sign In →':'📥 आयात & साइन इन →',
    'Import from another device':'📥 दूसरे डिवाइस से आयात',
    'Back to Sign In':'← साइन इन पर वापस',
    'enter username':'आपका_उपयोगकर्ता_नाम','enter password':'••••••••',
    'Security Question':'सुरक्षा प्रश्न','Your Answer':'आपका उत्तर',
    'Tournament Name':'टूर्नामेंट का नाम','Edition':'संस्करण','Year':'वर्ष',
    'Overs Format':'ओवर प्रारूप','Save Tournament':'💾 सहेजें',
    'Team Name':'टीम का नाम','Team Code':'कोड (2-3 अक्षर)','City':'शहर',
    'Add Team':'✅ टीम जोड़ें','Clear':'🗑 साफ करें',
    'Player Name':'खिलाड़ी का नाम','Jersey #':'जर्सी नं.','Role':'भूमिका',
    'Schedule Match':'📅 मैच शेड्यूल','+ Schedule':'+ शेड्यूल',
    'Match Stage':'मैच चरण','Venue':'स्थान','Date':'तारीख',
    'Umpires':'अंपायर','Start':'▶ शुरू करें','Edit':'✏️ संपादित करें','Delete':'हटाएं',
    'Team A':'टीम A की XI','Team B':'टीम B की XI',
    'DOT':'डॉट','WIDE':'वाइड','NO BALL':'नो बॉल','BYE':'बाई','LEG BYE':'लेग बाई',
    'WICKET':'⚡ विकेट','Manage':'⚙️ खिलाड़ियों को प्रबंधित करें',
    'Retired Hurt':'🚑 चोटिल होकर रिटायर','Ball-by-Ball':'🎯 गेंद-दर-गेंद',
    'ON STRIKE':'★ स्ट्राइक पर','non-striker':'(नॉन-स्ट्राइकर)','Bowling':'(गेंदबाजी)',
    'THIS OVER:':'इस ओवर:','Actions:':'⚡ कार्रवाइयाँ:',
    'Target:':'🎯 लक्ष्य:','Need:':'चाहिए:','CRR:':'मौजूदा RR:','RRR:':'जरूरी RR:',
    'P-ship:':'साझेदारी:','FoW:':'विकेट का पतन:',
    'Toss Won By':'टॉस जीता','Decision':'निर्णय',
    'Bat':'बल्लेबाजी','Bowl':'गेंदबाजी','Confirm Toss':'✅ टॉस पुष्टि करें',
    'Batting Team':'बल्लेबाजी टीम','Bowling Team':'गेंदबाजी टीम',
    'Select Opener 1':'ओपनर 1 चुनें','Select Opener 2':'ओपनर 2 चुनें',
    'Opening Bowler':'शुरुआती गेंदबाज','Start Innings':'▶ पारी शुरू करें',
    'Select Bowler':'नया गेंदबाज चुनें','Confirm Over':'✅ ओवर पुष्टि करें',
    'Dismissal Type':'आउट होने का तरीका','Next Batsman':'अगला बल्लेबाज',
    'Fielder Name':'क्षेत्ररक्षक का नाम','Confirm Wicket':'✅ विकेट पुष्टि करें',
    'Set Striker':'स्ट्राइकर सेट करें','Set Non-Striker':'नॉन-स्ट्राइकर सेट करें',
    'Change Bowler':'गेंदबाज बदलें','Apply':'✅ लागू करें',
    'Completed Matches':'पूरे हुए मैच','Points Table':'अंक तालिका',
    'Batting':'🏏 बल्लेबाजी','Bowling':'🎳 गेंदबाजी','Fielding':'🧤 क्षेत्ररक्षण','Awards':'🏅 पुरस्कार',
    'Player (batting)':'खिलाड़ी','M':'म','Inn':'पारी','Runs':'रन','Balls':'गेंदें',
    'Avg':'औसत','SR':'स्ट्राइक रेट','HS':'उच्च स्कोर','100s':'शतक','50s':'अर्धशतक','6s':'छक्के','4s':'चौके','Ducks':'डक','NO':'नॉट आउट',
    'Wkts':'विकेट','Best':'सर्वश्रेष्ठ','Eco':'अर्थव्यवस्था','Mdns':'मेडन','Wds':'वाइड','NBs':'नो बॉल',
    'Catches':'कैच','Stumpings':'स्टंपिंग','Run Outs':'रन आउट','Total':'कुल',
    'Tournament Champion':'🏆 टूर्नामेंट चैंपियन','Orange Cap':'🟠 ऑरेंज कैप','Purple Cap':'🟣 पर्पल कैप',
    'Man of the Match':'🏅 मैन ऑफ द मैच',
    'Match Awards':'🏅 मैच पुरस्कार','Save Awards':'💾 पुरस्कार सहेजें','Skip':'छोड़ें',
    'Tournament Details':'🏆 टूर्नामेंट विवरण','Add Teams':'➕ टीमें जोड़ें',
    'Manage Players':'👤 खिलाड़ियों को प्रबंधित करें','Share Link':'🔗 शेयर लिंक',
    'Export Account':'📤 खाता निर्यात','Import Account':'📥 खाता आयात',
    'Copy Link':'📋 लिंक कॉपी करें','Open Link':'🔗 खोलें','Copy Code':'📋 कोड कॉपी करें',
    'Player':'खिलाड़ी','Umpire':'अंपायर','Cancel':'रद्द करें','Close':'✕ बंद करें',
    'Save':'सहेजें','Confirm':'पुष्टि करें','No Result':'कोई परिणाम नहीं',
    'Language selected':'चुना गया',
  },
};
let CURRENT_LANG=lsGet('stumply_lang')||'en';

function renderHelp(){
  let box=document.getElementById('help-body');if(!box)return;
  let H=HELP_DATA[CURRENT_LANG]||HELP_DATA.en;if(!H)return;
  const tx=v=>esc(v).replace(/\[\[(.+?)\]\]/g,'<span class="demo-tag">$1</span>');
  box.innerHTML='<p style="font-size:12px;color:var(--dim);margin:10px 2px 8px;line-height:1.5">'+H.intro+'</p>'+
    H.sections.map((x,i)=>'<details class="hsec"'+(i?'':' open')+'><summary><span class="hico">'+x[0]+'</span>'+esc(x[1])+'</summary><div class="hbody"><'+x[2]+'>'+
      x[3].map(li=>'<li>'+tx(li)+'</li>').join('')+'</'+x[2]+'>'+(x[4]?'<p>'+tx(x[4])+'</p>':'')+'</div></details>').join('');
}
function t(key){return(LANGS[CURRENT_LANG]||LANGS.en)[key]||key;}

// Set text from code (kept as a single place to do it)
function setTxt(el,text){if(!el)return;el.textContent=text;}

// ══════════════════════════════════════════════════════════════════════════
//  TRANSLATION ENGINE
//  Every piece of English text on screen is looked up in I18N_X[language] and
//  swapped in place, including text drawn later (scores, dialogs, messages).
//  Names typed by users are left alone: only exact dictionary matches change.
// ══════════════════════════════════════════════════════════════════════════
const _i18nNodes=new Set();
function i18nFill(tpl,args){return String(tpl).replace(/\{(\d)\}/g,(m,i)=>args[+i]??'');}
// Sentences that contain names or numbers: [pattern, dictionary key, which captures to translate]
const I18N_PAT=[
  [/^(.+): where did it go\?$/,'%ww_title'],
  [/^Wagon wheel — (.+)$/,'%ww_head'],
  [/^(\d+) match(?:es)? will be created over (\d+) days?\.$/,'%fx_plan'],
  [/^(\d+) match(?:es)? scheduled$/,'%fx_done'],
  [/^(.+) won by (\d+) runs? \(revised target\)$/,'%won_runs_rev'],
  [/^(.+) won by (\d+) wickets? \(revised target\)$/,'%won_wkts_rev'],
  [/^Match tied — (.+) won the Super Over$/,'%so_won'],
  [/^Super Over: (.+) need to defend (\d+)$/,'%so_defend'],
  [/^Super Over — (.+) batting$/,'%so_batting'],
  [/^Super Over · (.+)$/,'%so_team'],
  [/^Super Over (\d+)$/,'%so_n'],
  [/^Updated (\d{1,2} [A-Z][a-z]{2})$/,'%updated'],
  [/^(.+) — Super Over (\d+)$/,'%team_so_n'],
  [/^(.+) — ⚡ SUPER OVER (\d+)$/,'%team_so_n_up'],
  [/^Super Over (\d+) — (.+) batting$/,'%so_n_batting'],
  [/^(.+) need (\d+ runs?) to win from (\d+ overs?)$/,'%need_win_from',[1,2]],
  [/^(.+) — Super Over$/,'%team_so'],
  [/^(.+) — ⚡ SUPER OVER$/,'%team_so_up'],
  [/^(\d+) mandatory players$/,'%mand_players'],
  [/^OPTIONAL SUBSTITUTES \((\d+)–(\d+)\)$/,'%opt_subs'],
  [/^Team ([AB]): fill all (\d+) players \((\d+) missing\)$/,'%fill_all'],
  [/^Team ([AB]) must have (\d+) players$/,'%must_have'],
  [/^New overs must be fewer than (\d+)\.$/,'%rain_fewer'],
  [/^([\d.]+) overs are already bowled\. Enter (\d+) or more\.$/,'%rain_bowled'],
  [/^Now: (\d+) overs a side\. ([\d.]+) overs bowled in this innings\.$/,'%rain_now'],
  [/^Suggested target (\d+) scales (.+) to (.+) by run rate\. This is not official DLS\. If you use a DLS app, type its target instead\.$/,'%rain_sug',[1,2]],
  [/^Match cut to (\d+) overs a side — new target (\d+)$/,'%rain_cut_t'],
  [/^Match cut to (\d+) overs a side$/,'%rain_cut'],
  [/^Reduced to (\d+) overs a side$/,'%rain_reduced'],
  [/^Ball-by-ball commentary \((\d+)\)$/,'%bbb'],
  [/^— End of over (\d+) —$/,'%end_over'],
  [/^wide \+ (\d+ runs?)$/,'%wide_plus',[0]],
  [/^no ball \+ (\d+ runs?) \(off the bat\)$/,'%nb_plus_bat',[0]],
  [/^no ball \+ (\d+ runs?)$/,'%nb_plus',[0]],
  [/^vs (.+)$/,'%vs'],
  [/^by @(.+)$/,'%by'],
  [/^@(.+) is already a co-scorer\.$/,'%sc_already'],
  [/^@(.+) can now score this tournament$/,'%sc_added'],
  [/^@(.+) removed$/,'%sc_removed'],
  [/^(Final|Semi-finals) created — see Matches$/,'%ko_created',[0]],
  [/^(.+) won by (\d+) runs?$/,'%won_runs'],
  [/^(.+) won by (\d+) wickets?$/,'%won_wkts'],
  [/^No Result — (.+)$/,'%no_result',[0]],
  [/^(.+) elected to BAT$/,'%elected_bat'],
  [/^(.+) elected to BOWL$/,'%elected_bowl'],
  [/^Innings (\d+) — (.+) batting$/,'%innings_batting'],
  [/^(.+) — Innings (\d+)$/,'%team_innings'],
  [/^(.+) — INN (\d+)$/,'%team_inn'],
  [/^\(([\d.]+) \/ (\d+) Ov\)$/,'%ov_of'],
  [/^\(([\d.]+) Overs of (\d+)\)$/,'%overs_of'],
  [/^(\d+)-over format$/,'%over_format'],
  [/^Match abandoned — No Result \((.+)\)$/,'%abandoned',[0]],
  [/^Max (\d+) overs reached!?$/,'%max_overs'],
  [/^Max (\d+) overs per bowler!?$/,'%max_overs_bowler'],
  [/^(\d+) players loaded from squad$/,'%players_loaded'],
  [/^Required — Player (\d+)$/,'%req_player'],
  [/^Sub (\d+) \(optional\)$/,'%sub_optional'],
  [/^Player (\d+): (.+)$/,'%player_n',[1]],
  [/^jersey (\d+) is already used in this team$/i,'%jersey_used'],
  [/^jersey number must be 0 to 999$/i,'%jersey_range'],
  [/^"(.+)" is already in this team$/,'%name_used'],
  [/^(\d+) runs \((\d+) balls\)$/,'%runs_balls'],
  [/^(.+) out\. ⚙️ Tap Manage to set next batsman!$/,'%out_manage'],
  [/^(.+) retired hurt — use ⚙️ Manage to set next batsman$/,'%retired_manage'],
  [/^(.+) \((yet|batting|retired)\)$/,'%name_state',[1]],
  [/^Watching: (.+)$/,'%watching'],
  [/^Extras: (\d+) \((.*)\)$/,'%extras_line'],
  [/^Innings (\d+) Complete$/,'%innings_complete'],
  [/^(.+) added — (\d+) players(.*)$/,'%team_added'],
  [/^Switched to (.+)$/,'%switched'],
  [/^(.+) added$/,'%added'],
  [/^(.+) deleted$/,'%deleted'],
  [/^Player (\d+) name is required — all (\d+) players must be filled$/,'%player_required'],
];
function i18nTr(core){
  let X=I18N_X[CURRENT_LANG];if(!X)return null;
  if(X[core]!=null)return X[core];
  let m=core.match(/^([^\p{L}\p{N}(]*)([\s\S]*?)([^\p{L}\p{N})]*)$/u);
  let pre=m?m[1]:'',mid=m?m[2]:core,suf=m?m[3]:'';
  if(!mid)return null;
  if(mid!==core&&X[mid]!=null)return pre+X[mid]+suf;
  if(suf&&X[mid+suf]!=null)return pre+X[mid+suf];
  if(pre&&X[pre+mid]!=null)return X[pre+mid]+suf;
  for(const [re,key,trs] of I18N_PAT){
    if(X[key]==null)continue;
    let whole=core.match(re),k=whole||mid.match(re);
    if(k){
      let args=k.slice(1).map((a,i)=>(trs&&trs.includes(i))?(i18nTr(a)??a):a);
      let out=i18nFill(X[key],args);
      return whole?out:pre+out+suf;
    }
  }
  // "4 Teams | 3 Matches" → each part on its own
  for(const sep of [' | ',' · ']){
    if(mid.includes(sep)){
      let hit=false,parts=mid.split(sep).map(x=>{let v=i18nTr(x);if(v!=null)hit=true;return v??x;});
      if(hit)return pre+parts.join(sep)+suf;
    }
  }
  // "12 runs" → number + translated unit
  let n=mid.match(/^([\d.,\/*+×\-]+)\s+(.+)$/);
  if(n&&X[n[2]]!=null)return pre+n[1]+' '+X[n[2]]+suf;
  // "Label: value" → translated label, value translated when known
  let c=mid.match(/^([^:]{2,32}):\s*(.+)$/);
  if(c&&X[c[1]]!=null)return pre+X[c[1]]+': '+(X[c[2]]!=null?X[c[2]]:c[2])+suf;
  return null;
}
function i18nSkip(node){
  let p=node.parentNode;if(!p||p.nodeType!==1)return true;
  let tag=p.nodeName;if(tag==='SCRIPT'||tag==='STYLE'||tag==='TEXTAREA')return true;
  return !!p.closest('#lang-grid,[data-noi18n],.logo');
}
function i18nNode(node){
  let cur=node.nodeValue;
  if(node._i18nOut===cur||i18nSkip(node))return;
  let m=cur.match(/^(\s*)([\s\S]*?)(\s*)$/),core=m[2].replace(/\s+/g,' ');
  if(!core||!/[A-Za-z]/.test(core))return;
  let v=i18nTr(core);
  if(window.__i18nSeen&&v==null)window.__i18nSeen.add(core);
  if(v==null||v===core)return;
  let p=node.parentNode;
  if(p.nodeName==='OPTION'&&!p.hasAttribute('value'))p.setAttribute('value',core); // keep the value the code expects
  node._i18nOrig=cur;node._i18nOut=m[1]+v+m[3];node.nodeValue=node._i18nOut;_i18nNodes.add(node);
}
function i18nWalk(root){
  if(!root)return;
  if(root.nodeType===3){i18nNode(root);return;}
  if(root.nodeType!==1)return;
  let w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),n,list=[];
  while((n=w.nextNode()))list.push(n);
  list.forEach(i18nNode);
  // placeholders
  let els=root.matches&&root.matches('input[placeholder]')?[root]:[];
  root.querySelectorAll&&root.querySelectorAll('input[placeholder]').forEach(e=>els.push(e));
  els.forEach(e=>{
    if(e.dataset.ph==null)e.dataset.ph=e.placeholder;
    let v=i18nTr(e.dataset.ph);
    if(window.__i18nSeen&&v==null&&/[A-Za-z]{3}/.test(e.dataset.ph))window.__i18nSeen.add(e.dataset.ph);
    e.placeholder=v!=null?v:e.dataset.ph;
  });
}
function i18nRestore(){
  _i18nNodes.forEach(n=>{if(n.nodeValue===n._i18nOut)n.nodeValue=n._i18nOrig;n._i18nOut=null;});
  _i18nNodes.clear();
  document.querySelectorAll('input[data-ph]').forEach(e=>{e.placeholder=e.dataset.ph;});
}
let _i18nObs=null;
function i18nWatch(){
  if(_i18nObs||typeof MutationObserver==='undefined')return;
  _i18nObs=new MutationObserver(muts=>{
    if(!I18N_X[CURRENT_LANG])return;
    for(const mu of muts){
      if(mu.type==='characterData')i18nNode(mu.target);
      else mu.addedNodes.forEach(i18nWalk);
    }
    if(_i18nNodes.size>4000)_i18nNodes.forEach(n=>{if(!n.isConnected)_i18nNodes.delete(n);});
  });
  _i18nObs.observe(document.body,{subtree:true,childList:true,characterData:true});
}
function applyLanguage(){
  const L=LANGS[CURRENT_LANG]||LANGS.en,isEn=!LANGS[CURRENT_LANG]||CURRENT_LANG==='en';
  document.documentElement.lang=CURRENT_LANG;
  const strip=v=>String(v||'').replace(/^[^\p{L}\p{N}]+/u,'');

  // 3. Everything else on screen, now and whenever it is redrawn
  renderHelp();
  i18nRestore();
  if(!isEn){i18nWalk(document.body);i18nWatch();}

  // 5. Top bar
  let langBtn=document.getElementById('lang-btn');
  if(langBtn){let lv=strip(L['Language'])||'Language';langBtn.innerHTML='🌐<span class="lbl"> '+esc(lv)+'</span>';langBtn.title=lv;}

  try{layoutTop();}catch(e){}
}

function openLangModal(){
  let grid=document.getElementById('lang-grid');
  grid.innerHTML=Object.entries(LANGS).map(([code,lang])=>`
    <div class="lang-opt${code===CURRENT_LANG?' active':''}" onclick="setLang('${code}')">
      <div class="lang-name">${lang.flag}</div>
      <div class="lang-native">${lang.native}</div>
      <div class="lang-en">${lang.name}</div>
    </div>`).join('');
  openM('lang-mo');
}
function setLang(code){
  CURRENT_LANG=code;
  lsSet('stumply_lang',code);
  try{refreshView();}catch(e){}
  applyLanguage();
  // Update active state
  document.querySelectorAll('.lang-opt').forEach(el=>{
    el.classList.toggle('active',el.getAttribute('onclick')===`setLang('${code}')`);
  });
  toast(LANGS[code]?.native+' '+t('Language selected')||'Language set');
}
