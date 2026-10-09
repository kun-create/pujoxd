// Database of existing pandals and duplicate checking logic
const rawPujos = [
  { name: "Haridevpur 41 Pally Club", category: "South Kolkata", lat: 22.4790, lng: 88.3490 },
  { name: "A-9 Square Park", category: "Salt Lake", lat: 22.5875, lng: 88.4045 },
  { name: "Arjunpur Amra Sabai Club", category: "North Kolkata", lat: 22.6320, lng: 88.4150 },
  { name: "Tala Ponero (15) Pally Durga Puja", category: "North Kolkata", lat: 22.6085, lng: 88.3730 },
  { name: "Ballygunge 21 Pally", category: "South Kolkata", lat: 22.5215, lng: 88.3625 },
  { name: "Burmah Shell Colony, Sodepur", category: "North Kolkata", lat: 22.7150, lng: 88.3820 },
  { name: "Behala Friend's Club", category: "South Kolkata", lat: 22.4920, lng: 88.3305 },
  { name: "Behala Natun Sangha", category: "South Kolkata", lat: 22.4905, lng: 88.3285 },
  { name: "Bhowanipur 75 Palli", category: "South Kolkata", lat: 22.5310, lng: 88.3475 },
  { name: "Brindabon Matri Mandir", category: "North Kolkata", lat: 22.5800, lng: 88.3700 },
  { name: "Chorbagan Sarbojonin", category: "North Kolkata", lat: 22.5845, lng: 88.3660 },
  { name: "Darjipara sarbojanin Durgotsab", category: "North Kolkata", lat: 22.5895, lng: 88.3675 },
  { name: "Dum Dum Park Sarbojanin Durga Puja Samity", category: "North Kolkata", lat: 22.6220, lng: 88.4020 },
  { name: "Garia Mitali Sangha (Naba Durga)", category: "South Kolkata", lat: 22.4650, lng: 88.3880 },
  { name: "Golaghata Sammilani Club", category: "North Kolkata", lat: 22.5890, lng: 88.4120 },
  { name: "Halsibagan Sarbajanin", category: "North Kolkata", lat: 22.5880, lng: 88.3760 },
  { name: "ITI More Durga Puja Ground, Kalyani", category: "North Kolkata", lat: 22.9850, lng: 88.4350 },
  { name: "Jitendra Smriti Sangha", category: "North Kolkata", lat: 22.5765, lng: 88.3690 },
  { name: "Jorasanko 7 Palli Sarbojonin Durga Puja", category: "North Kolkata", lat: 22.5810, lng: 88.3580 },
  { name: "Kalighat Milan Sangha", category: "South Kolkata", lat: 22.5220, lng: 88.3450 },
  { name: "Khidderpore Pally Saradiya", category: "South Kolkata", lat: 22.5370, lng: 88.3290 },
  { name: "Lalabagan Sarbojanin Puja Ground", category: "North Kolkata", lat: 22.5905, lng: 88.3725 },
  { name: "Dum Dum Mall Palli Club", category: "North Kolkata", lat: 22.6180, lng: 88.3990 },
  { name: "Mitra Sangha", category: "North Kolkata", lat: 22.5775, lng: 88.3655 },
  { name: "Netaji Colony Lowland Durgotsov", category: "North Kolkata", lat: 22.6230, lng: 88.3850 },
  { name: "North Tridhara Durga Puja", category: "South Kolkata", lat: 22.5245, lng: 88.3635 },
  { name: "Pradip Sangha Ground", category: "North Kolkata", lat: 22.5815, lng: 88.3675 },
  { name: "Prafullakanan Paschim Adhibasi Brinda, Kestopur", category: "North Kolkata", lat: 22.6150, lng: 88.4190 },
  { name: "Rath Tala Durga Puja Mandap", category: "North Kolkata", lat: 22.6280, lng: 88.3810 },
  { name: "Sahid Colony", category: "North Kolkata", lat: 22.6350, lng: 88.3870 },
  { name: "Satero Pally Sarbojonin Durgotsav", category: "North Kolkata", lat: 22.5830, lng: 88.3710 },
  { name: "Sikdar Bagan Sadharan Durgotsov", category: "North Kolkata", lat: 22.5920, lng: 88.3710 },
  { name: "Ultadanga Pallyshree Durga Puja", category: "North Kolkata", lat: 22.6040, lng: 88.3820 },
  { name: "Vivekananda Sarbojonin Durgatsob Committee", category: "South Kolkata", lat: 22.5130, lng: 88.3490 },
  { name: "Belgachia Sadharon Durgotsav", category: "North Kolkata", lat: 22.6100, lng: 88.3850 },
  { name: "Purbachal Club", category: "Salt Lake", lat: 22.5910, lng: 88.3950 },
  { name: "Alipore 78 Pally Club", category: "South Kolkata", lat: 22.5290, lng: 88.3370 },
  { name: "Master Da Smriti Sangha Club", category: "South Kolkata", lat: 22.4890, lng: 88.3550 },
  { name: "Bidhan Sarani Atlas Club", category: "North Kolkata", lat: 22.5890, lng: 88.3700 },
  { name: "Surir Bagan Sarbojanin Durgapuja", category: "North Kolkata", lat: 22.5842, lng: 88.3682 },
  { name: "Barisha Sarbojonin", category: "South Kolkata", lat: 22.4880, lng: 88.3250 },
  { name: "Haridevpur New Sporting Club", category: "South Kolkata", lat: 22.4770, lng: 88.3495 },
  { name: "State Bank Park", category: "South Kolkata", lat: 22.4940, lng: 88.3680 },
  { name: "Nutan Sangha Durga Puja Committee", category: "North Kolkata", lat: 22.5825, lng: 88.3735 },
  { name: "Amarendra Bhavan Durga Puja (Roy House Puja)", category: "South Kolkata", lat: 22.5330, lng: 88.3460 },
  { name: "11 Pally Club", category: "South Kolkata", lat: 22.4930, lng: 88.3320 },
  { name: "trishakti sangha", category: "South Kolkata", lat: 22.5010, lng: 88.3580 },
  { name: "Santoshpur Avenue South Durga Puja", category: "South Kolkata", lat: 22.4950, lng: 88.3795 },
  { name: "Swapner Bagan Sporting Club", category: "North Kolkata", lat: 22.5925, lng: 88.3685 },
  { name: "AUROBINDO SETU SARBOJANIN DURGAPUJA SAMITI", category: "North Kolkata", lat: 22.5790, lng: 88.3740 },
  { name: "Sater Palli Sarbojonin Durgotsav Committe", category: "North Kolkata", lat: 22.5835, lng: 88.3715 },
  { name: "Gourimata Udyan", category: "North Kolkata", lat: 22.5912, lng: 88.3745 },
  { name: "Sri Sri Jagaddhatri Puja Kumartuli", category: "North Kolkata", lat: 22.5962, lng: 88.3618 },
  { name: "20 Palli Sarbojani Durgotsab", category: "South Kolkata", lat: 22.5160, lng: 88.3480 },
  { name: "Nimtala Sarbojanin DurgaPuja", category: "North Kolkata", lat: 22.5910, lng: 88.3520 },
  { name: "Jorasanko Sadharan Durgotsav Samity", category: "North Kolkata", lat: 22.5805, lng: 88.3585 },
  { name: "Chaltabagan Durga Puja Pandal", category: "North Kolkata", lat: 22.5820, lng: 88.3740 },
  { name: "Dakshindari Youth", category: "North Kolkata", lat: 22.6020, lng: 88.3910 },
  { name: "Bandhudal Sporting Club", category: "South Kolkata", lat: 22.5140, lng: 88.3520 },
  { name: "Nawpara Dada Bhai Sangha", category: "North Kolkata", lat: 22.6210, lng: 88.3880 },
  { name: "MANASBAG SARBOJONIN DURGOTSAV", category: "North Kolkata", lat: 22.6150, lng: 88.3830 },
  { name: "Bani Mandir Park", category: "North Kolkata", lat: 22.5865, lng: 88.3725 },
  { name: "Panchanan Tala Youth Association Club", category: "North Kolkata", lat: 22.5930, lng: 88.3800 },
  { name: "75 Pally Khidderpore", category: "South Kolkata", lat: 22.5375, lng: 88.3295 },
  { name: "Udayan Kidderpore", category: "South Kolkata", lat: 22.5365, lng: 88.3310 },
  { name: "Rupchand Mukherjee Lane Durga Puja", category: "South Kolkata", lat: 22.5285, lng: 88.3465 },
  { name: "ALIPORE SARBOJANIN", category: "South Kolkata", lat: 22.5315, lng: 88.3385 },
  { name: "Forward Club", category: "South Kolkata", lat: 22.5195, lng: 88.3505 },
  { name: "kalighat Yuba Maitry Durga Puja", category: "South Kolkata", lat: 22.5215, lng: 88.3445 },
  { name: "Hazra Park Durga Puja", category: "South Kolkata", lat: 22.5255, lng: 88.3485 },
  { name: "Bhowanipur Sarbojanin Durgotsav Durga puja", category: "South Kolkata", lat: 22.5325, lng: 88.3470 },
  { name: "76 Palli Club", category: "South Kolkata", lat: 22.5188, lng: 88.3492 },
  { name: "Agradut Udaya Sangha", category: "South Kolkata", lat: 22.5112, lng: 88.3502 },
  { name: "22 Pally Club", category: "South Kolkata", lat: 22.5082, lng: 88.3572 },
  { name: "Kanai Dhar Ln", category: "North Kolkata", lat: 22.5785, lng: 88.3610 },
  { name: "Raja Subodh Mallick Square Park", category: "North Kolkata", lat: 22.5645, lng: 88.3590 },
  { name: "Wellington Nagarik Kalyan Samity", category: "North Kolkata", lat: 22.5655, lng: 88.3605 },
  { name: "Briji Unnayan Samity Club", category: "South Kolkata", lat: 22.4680, lng: 88.3850 },
  { name: "Patuli Upnagari Durga Pandal", category: "South Kolkata", lat: 22.4750, lng: 88.3880 },
  { name: "Baghajatin B & C Durga Puja Art", category: "South Kolkata", lat: 22.4830, lng: 88.3740 },
  { name: "BAGHAJATIN TARUN SANGHA", category: "South Kolkata", lat: 22.4820, lng: 88.3730 },
  { name: "Maitri Sansad Club and Ground", category: "South Kolkata", lat: 22.4995, lng: 88.3710 },
  { name: "Vivekananda Sishu Udyan", category: "South Kolkata", lat: 22.5022, lng: 88.3542 },
  { name: "Jadavpur Athletic Club", category: "South Kolkata", lat: 22.4960, lng: 88.3690 },
  { name: "Tarun Sathi", category: "South Kolkata", lat: 22.4870, lng: 88.3620 },
  { name: "New Town Durga Puja Committee, BG Block", category: "Salt Lake", lat: 22.5920, lng: 88.4410 },
  { name: "Aswininagar Bandhumahal Club, Baguiati", category: "North Kolkata", lat: 22.6180, lng: 88.4220 },
  { name: "Aswininagar Sarbojanin Durgotsav", category: "North Kolkata", lat: 22.6175, lng: 88.4215 },
  { name: "Shastri Bagan Sporting Club", category: "North Kolkata", lat: 22.6090, lng: 88.3975 },
  { name: "Dakshinpara durgotsab committee", category: "South Kolkata", lat: 22.4815, lng: 88.3640 },
  { name: "Tejendra Uddyan (Teenkonia Park)", category: "North Kolkata", lat: 22.5812, lng: 88.3588 },
  { name: "Tarapukur Adi Sarbajanin Durgotsav commitee Milan sangha", category: "North Kolkata", lat: 22.7050, lng: 88.3800 },
  { name: "Ultadanga Bidhan Sangha", category: "North Kolkata", lat: 22.6035, lng: 88.3815 },
  { name: "Greenpark Recreation Club", category: "South Kolkata", lat: 22.5040, lng: 88.3670 },
  { name: "Sahid Nagar", category: "South Kolkata", lat: 22.4935, lng: 88.3650 },
  { name: "Vidyasagar central sarbajanin durgotsab", category: "North Kolkata", lat: 22.5760, lng: 88.3670 },
  { name: "JAGORANI SANGHA DURGA PUJA PANDAL", category: "South Kolkata", lat: 22.4980, lng: 88.3565 },
  { name: "Ram Mohan Smriti Sangha", category: "North Kolkata", lat: 22.5725, lng: 88.3665 },
  { name: "Apanjan Club", category: "South Kolkata", lat: 22.5180, lng: 88.3472 },
  { name: "Sarodia Sammilani", category: "South Kolkata", lat: 22.5125, lng: 88.3605 },
  { name: "Akshra Temple New Alipore", category: "South Kolkata", lat: 22.5042, lng: 88.3415 },
  { name: "Central Park Mela Ground", category: "Salt Lake", lat: 22.5862, lng: 88.4068 },
  { name: "Bagbazar Sarbojanin Durga Puja Mandap", category: "North Kolkata", lat: 22.6001, lng: 88.3695 },
  { name: "Shiv Mandir Sarbajanin Durga Puja", category: "South Kolkata", lat: 22.5100, lng: 88.3470 },
  { name: "Vivekananda Sarbojanin Durgotsav", category: "South Kolkata", lat: 22.5132, lng: 88.3492 },
  { name: "Gauri Bari Sarbojanin Durga Puja Pandal", category: "North Kolkata", lat: 22.5918, lng: 88.3742 },
  { name: "Lake Terrace Friend's Club", category: "South Kolkata", lat: 22.5170, lng: 88.3602 },
  { name: "Prasannamayee Ghat", category: "South Kolkata", lat: 22.5145, lng: 88.3430 },
  { name: "Nepal Bhattacharya Street Club Durga Puja", category: "South Kolkata", lat: 22.5200, lng: 88.3460 },
  { name: "Uttar Kolkata Sarbojanin Durga Puja- Birendra Mancha", category: "North Kolkata", lat: 22.5945, lng: 88.3698 },
  { name: "Dewanpara Maath Durga Pujo", category: "North Kolkata", lat: 22.6400, lng: 88.3750 },
  {
    "name": "Srimani Barir Durga Pujo",
    "category": "Bonedi Bari",
    "lat": 22.5821,
    "lng": 88.3612
  },
  {
    "name": "Hathkhola Dutta Barir Durga Pujo",
    "category": "Bonedi Bari",
    "lat": 22.5934,
    "lng": 88.3651
  },
  {
    "name": "Sovabazar Rajbarir Durga Pujo",
    "category": "Bonedi Bari",
    "lat": 22.5971,
    "lng": 88.3632
  },
  {
    "name": "Roychoudhury Barir Durga Pujo",
    "category": "Bonedi Bari",
    "lat": 22.512,
    "lng": 88.341
  },
  {
    "name": "Khelat Ghose er Durga Pujo",
    "category": "Bonedi Bari",
    "lat": 22.589,
    "lng": 88.362
  },
  {
    "name": "Rani Rashmoni er Durga Pujo",
    "category": "Bonedi Bari",
    "lat": 22.564,
    "lng": 88.351
  },
  {
    "name": "RAMDULAL NIBAS er Durga Pujo",
    "category": "Bonedi Bari",
    "lat": 22.5912,
    "lng": 88.364
  },
  {
    "name": "Baghbazar Haldar Bari er Pujo",
    "category": "Bonedi Bari",
    "lat": 22.6005,
    "lng": 88.368
  },
  {
    "name": "Ahiritola",
    "category": "North Kolkata",
    "lat": 22.5975,
    "lng": 88.3643
  },
  {
    "name": "College Square",
    "category": "North Kolkata",
    "lat": 22.576,
    "lng": 88.3639
  },
  {
    "name": "Anupama Housing Complex",
    "category": "North Kolkata",
    "lat": 22.615,
    "lng": 88.412
  },
  {
    "name": "Dum Dum Park Tarun Sangha",
    "category": "North Kolkata",
    "lat": 22.62,
    "lng": 88.4
  },
  {
    "name": "Dum Dum Park Bharat Chakra",
    "category": "North Kolkata",
    "lat": 22.624,
    "lng": 88.405
  },
  {
    "name": "Dum Dum Tarun Dal",
    "category": "North Kolkata",
    "lat": 22.619,
    "lng": 88.398
  },
  {
    "name": "Dum Dum Park Yubak Brinda",
    "category": "North Kolkata",
    "lat": 22.621,
    "lng": 88.401
  },
  {
    "name": "Baghbazar Sarbojonin Durgotsab & Exhibition",
    "category": "North Kolkata",
    "lat": 22.605118,
    "lng": 88.365859
  },
  {
    "name": "Joramandir",
    "category": "North Kolkata",
    "lat": 22.578,
    "lng": 88.372
  },
  {
    "name": "Telengabagan",
    "category": "North Kolkata",
    "lat": 22.588,
    "lng": 88.375
  },
  {
    "name": "Karbagan Sarbojanin",
    "category": "North Kolkata",
    "lat": 22.585,
    "lng": 88.372
  },
  {
    "name": "Gouriberia",
    "category": "North Kolkata",
    "lat": 22.582,
    "lng": 88.37
  },
  {
    "name": "Kumartuli Park",
    "category": "North Kolkata",
    "lat": 22.595,
    "lng": 88.3621
  },
  {
    "name": "Laketown Adhibasi Brinda",
    "category": "North Kolkata",
    "lat": 22.605,
    "lng": 88.395
  },
  {
    "name": "Laketown Netaji Sporting Club",
    "category": "North Kolkata",
    "lat": 22.607,
    "lng": 88.397
  },
  {
    "name": "Md. Ali Park",
    "category": "North Kolkata",
    "lat": 22.5753,
    "lng": 88.3582
  },
  {
    "name": "Mitali - Kankurgachi",
    "category": "North Kolkata",
    "lat": 22.575,
    "lng": 88.39
  },
  {
    "name": "Salt Lake CJ Block",
    "category": "Salt Lake",
    "lat": 22.579,
    "lng": 88.405
  },
  {
    "name": "Salt Lake BJ Block",
    "category": "Salt Lake",
    "lat": 22.5921,
    "lng": 88.411
  },
  {
    "name": "Salt Lake FD Block",
    "category": "Salt Lake",
    "lat": 22.5855,
    "lng": 88.4072
  },
  {
    "name": "Salt Lake GD Block",
    "category": "Salt Lake",
    "lat": 22.572,
    "lng": 88.412
  },
  {
    "name": "Salt Lake HA Block",
    "category": "Salt Lake",
    "lat": 22.573,
    "lng": 88.402
  },
  {
    "name": "Swapnar Bagan",
    "category": "North Kolkata",
    "lat": 22.5925,
    "lng": 88.3685
  },
  {
    "name": "Lalabagan Yubak Brinda - Nabankur Sangha",
    "category": "North Kolkata",
    "lat": 22.587800,
    "lng": 88.376900
  },
  {
    "name": "Sammilita Lalabagan Sarbojanin",
    "category": "North Kolkata",
    "lat": 22.5905,
    "lng": 88.3725
  },
  {
    "name": "Salt Lake AE Block - Part 1",
    "category": "Salt Lake",
    "lat": 22.588,
    "lng": 88.405
  },
  {
    "name": "CIT Sarbojonin",
    "category": "North Kolkata",
    "lat": 22.573,
    "lng": 88.375
  },
  {
    "name": "Baghbazar Jagodharti",
    "category": "North Kolkata",
    "lng": 88.369,
    "lat": 22.5995
  },
  {
    "name": "Beliaghata 33 No Palli",
    "category": "North Kolkata",
    "lat": 22.562,
    "lng": 88.395
  },
  {
    "name": "Belgachia Sadharan Durgatsab",
    "category": "North Kolkata",
    "lat": 22.61,
    "lng": 88.385
  },
  {
    "name": "Kumartuli Sarbojonin",
    "category": "North Kolkata",
    "lat": 22.596,
    "lng": 88.3615
  },
  {
    "name": "Satadal",
    "category": "North Kolkata",
    "lat": 22.5845,
    "lng": 88.3735
  },
  {
    "name": "Salt Lake AE Block - Part 2",
    "category": "Salt Lake",
    "lat": 22.5885,
    "lng": 88.4055
  },
  {
    "name": "Salt Lake BE Block - Part 2",
    "category": "Salt Lake",
    "lat": 22.5905,
    "lng": 88.4165
  },
  {
    "name": "Salt Lake CK-CL Block",
    "category": "Salt Lake",
    "lat": 22.5975,
    "lng": 88.404
  },
  {
    "name": "Salt Lake DL block",
    "category": "Salt Lake",
    "lat": 22.5885,
    "lng": 88.412
  },
  {
    "name": "Karunamayee G Block",
    "category": "Salt Lake",
    "lat": 22.5835,
    "lng": 88.415
  },
  {
    "name": "Kamardanga Sitalatala - Howrah",
    "category": "North Kolkata",
    "lat": 22.58,
    "lng": 88.34
  },
  {
    "name": "Arupara Milan Sangha - Howrah",
    "category": "North Kolkata",
    "lat": 22.582,
    "lng": 88.338
  },
  {
    "name": "Naba Baghbazar",
    "category": "North Kolkata",
    "lat": 22.601,
    "lng": 88.369
  },
  {
    "name": "Bangur Avenue Protirodh Bahini",
    "category": "North Kolkata",
    "lat": 22.612,
    "lng": 88.408
  },
  {
    "name": "Goabagan Sarbojanin",
    "category": "North Kolkata",
    "lat": 22.5855,
    "lng": 88.3705
  },
  {
    "name": "Hari Ghosh Street",
    "category": "North Kolkata",
    "lat": 22.5875,
    "lng": 88.3715
  },
  {
    "name": "Sabeda Bagan",
    "category": "North Kolkata",
    "lat": 22.5915,
    "lng": 88.3765
  },
  {
    "name": "Behala Club",
    "category": "South Kolkata",
    "lat": 22.495,
    "lng": 88.33
  },
  {
    "name": "Debdaru Fatak",
    "category": "South Kolkata",
    "lat": 22.502,
    "lng": 88.352
  },
  {
    "name": "Behala Sree Sangha",
    "category": "South Kolkata",
    "lat": 22.491,
    "lng": 88.328
  },
  {
    "name": "Behala Youngmen's Association",
    "category": "South Kolkata",
    "lat": 22.493,
    "lng": 88.329
  },
  {
    "name": "Behala Adarsha Pally",
    "category": "South Kolkata",
    "lat": 22.49,
    "lng": 88.327
  },
  {
    "name": "Badamtala Ashar Sangha",
    "category": "South Kolkata",
    "lat": 22.515,
    "lng": 88.348
  },
  {
    "name": "Behala Nutan Dal",
    "category": "South Kolkata",
    "lat": 22.489,
    "lng": 88.326
  },
  {
    "name": "Bosepukur Talbagan",
    "category": "South Kolkata",
    "lat": 22.514,
    "lng": 88.382
  },
  {
    "name": "Rajdanga Tribarna Sangha",
    "category": "South Kolkata",
    "lat": 22.5125,
    "lng": 88.386
  },
  {
    "name": "Bosepukur Sitala Mandir",
    "category": "South Kolkata",
    "lat": 22.516,
    "lng": 88.38
  },
  {
    "name": "Singhi Park",
    "category": "South Kolkata",
    "lat": 22.5204,
    "lng": 88.3618
  },
  {
    "name": "Ekdalia Evergreen Club",
    "category": "South Kolkata",
    "lat": 22.5152,
    "lng": 88.365
  },
  {
    "name": "Jodhpur Park",
    "category": "South Kolkata",
    "lat": 22.5115,
    "lng": 88.366
  },
  {
    "name": "Selimpur Pally",
    "category": "South Kolkata",
    "lat": 22.504,
    "lng": 88.375
  },
  {
    "name": "Santoshpur Lake Pally",
    "category": "South Kolkata",
    "lat": 22.498,
    "lng": 88.378
  },
  {
    "name": "Mudiali Club",
    "category": "South Kolkata",
    "lat": 22.512,
    "lng": 88.345
  },
  {
    "name": "Shibmandir Sarbojonin Durgotsab",
    "category": "South Kolkata",
    "lat": 22.51,
    "lng": 88.347
  },
  {
    "name": "Naktala Udayan Sangha",
    "category": "South Kolkata",
    "lat": 22.485,
    "lng": 88.365
  },
  {
    "name": "Rajdanga Naba Uday Sangha",
    "category": "South Kolkata",
    "lat": 22.511,
    "lng": 88.385
  },
  {
    "name": "Suruchi Sangha",
    "category": "South Kolkata",
    "lat": 22.5081,
    "lng": 88.3377
  },
  {
    "name": "Tridhara Sammilani",
    "category": "South Kolkata",
    "lat": 22.523,
    "lng": 88.362
  },
  {
    "name": "Pratapaditya Road Tricone Park",
    "category": "South Kolkata",
    "lat": 22.5135,
    "lng": 88.351
  },
  {
    "name": "Sanghasree",
    "category": "South Kolkata",
    "lat": 22.5145,
    "lng": 88.3495
  },
  {
    "name": "Sebak Sangha",
    "category": "South Kolkata",
    "lat": 22.501,
    "lng": 88.355
  },
  {
    "name": "Dilip Smriti Sangha",
    "category": "South Kolkata",
    "lat": 22.503,
    "lng": 88.356
  },
  {
    "name": "Lake Youth Corner",
    "category": "South Kolkata",
    "lat": 22.5175,
    "lng": 88.3585
  },
  {
    "name": "Ekush Pally Sarbojonin Durgotsab",
    "category": "South Kolkata",
    "lat": 22.5195,
    "lng": 88.3595
  },
  {
    "name": "Acharya Prafulla Sangha - Behala",
    "category": "South Kolkata",
    "lat": 22.4885,
    "lng": 88.3245
  },
  {
    "name": "Adi Ballygunge",
    "category": "South Kolkata",
    "lat": 22.5225,
    "lng": 88.3645
  },
  {
    "name": "Ballygunge Cultural Association",
    "category": "South Kolkata",
    "lat": 22.521,
    "lng": 88.361
  },
  {
    "name": "Barisha Player's Corner",
    "category": "South Kolkata",
    "lat": 22.487,
    "lng": 88.323
  },
  {
    "name": "Barisha Sabuj Sathi Club",
    "category": "South Kolkata",
    "lat": 22.486,
    "lng": 88.322
  },
  {
    "name": "Barisha Tapoban",
    "category": "South Kolkata",
    "lat": 22.485,
    "lng": 88.321
  },
  {
    "name": "Behala Arcadia Sarbojonin",
    "category": "South Kolkata",
    "lat": 22.4925,
    "lng": 88.3315
  },
  {
    "name": "Durgabari",
    "category": "South Kolkata",
    "lat": 22.511,
    "lng": 88.353
  },
  {
    "name": "Ganbani Sangha",
    "category": "South Kolkata",
    "lat": 22.5065,
    "lng": 88.3575
  },
  {
    "name": "Samaj Sebi Sangha",
    "category": "South Kolkata",
    "lat": 22.525,
    "lng": 88.351
  },
  {
    "name": "Sodepur Pragati Sangha (Haridevpur)",
    "category": "South Kolkata",
    "lat": 22.478,
    "lng": 88.35
  },
  {
    "name": "Santoshpur Sonar Tori Durgotsav",
    "category": "South Kolkata",
    "lat": 22.497,
    "lng": 88.379
  },
  {
    "name": "Abasar Sarbojonin",
    "category": "South Kolkata",
    "lat": 22.5055,
    "lng": 88.359
  },
  {
    "name": "Goal Math",
    "category": "South Kolkata",
    "lat": 22.5025,
    "lng": 88.3545
  },
  {
    "name": "Barisha Netaji Sangha",
    "category": "South Kolkata",
    "lat": 22.484,
    "lng": 88.32
  },
  {
    "name": "Behala Buroshibtala Janakalyan Sangha",
    "category": "South Kolkata",
    "lat": 22.494,
    "lng": 88.333
  },
  {
    "name": "Jogajatri Club",
    "category": "South Kolkata",
    "lat": 22.5005,
    "lng": 88.3535
  },
  {
    "name": "Surya Nagar Sarbojonin",
    "category": "South Kolkata",
    "lat": 22.4795,
    "lng": 88.3525
  },
  {
    "name": "Salt Lake IA Block",
    "category": "Salt Lake",
    "lat": 22.575,
    "lng": 88.406
  },
  {
    "name": "Salt Lake Laboni",
    "category": "Salt Lake",
    "lat": 22.583,
    "lng": 88.4
  },
  {
    "name": "Santosh Mitra Square",
    "category": "North Kolkata",
    "lat": 22.5697,
    "lng": 88.3662
  },
  {
    "name": "Sealdah Railway Athletic Club",
    "category": "North Kolkata",
    "lat": 22.5652,
    "lng": 88.3711
  },
  {
    "name": "Sovabazar Beniatola",
    "category": "North Kolkata",
    "lat": 22.596000,
    "lng": 88.362000
  },
  {
    "name": "Sreebhumi Sporting Club",
    "category": "North Kolkata",
    "lat": 22.6074,
    "lng": 88.3813
  },
  {
    "name": "Tala Barowari",
    "category": "North Kolkata",
    "lat": 22.61,
    "lng": 88.375
  },
  {
    "name": "Manicktala Chaltabagan Loha Patty",
    "category": "North Kolkata",
    "lat": 22.582,
    "lng": 88.374
  },
  {
    "name": "Pathuriaghata Pancher Pally",
    "category": "North Kolkata",
    "lat": 22.589,
    "lng": 88.365
  },
  {
    "name": "Tala Palli",
    "category": "North Kolkata",
    "lat": 22.611,
    "lng": 88.376
  },
  {
    "name": "Ghas Bagan",
    "category": "North Kolkata",
    "lat": 22.584,
    "lng": 88.371
  },
  {
    "name": "Hatibagan Nabin Pally",
    "category": "North Kolkata",
    "lat": 22.5982,
    "lng": 88.3731
  },
  {
    "name": "Nalin Sarkar Street Sarbojanin Durgotsab",
    "category": "North Kolkata",
    "lat": 22.59,
    "lng": 88.373
  },
  {
    "name": "Hatibagan Sarbojanin",
    "category": "North Kolkata",
    "lat": 22.595,
    "lng": 88.372
  },
  {
    "name": "Olabibitala Sarbojanin",
    "category": "North Kolkata",
    "lat": 22.575,
    "lng": 88.335
  },
  {
    "name": "Yuva Brinda",
    "category": "North Kolkata",
    "lat": 22.603,
    "lng": 88.378
  },
  {
    "name": "Kashi Bose Lane",
    "category": "North Kolkata",
    "lat": 22.5831,
    "lng": 88.3694
  },
  {
    "name": "Purbachal Sarbojonin",
    "category": "Salt Lake",
    "lat": 22.591,
    "lng": 88.395
  },
  {
    "name": "Sovabazar Rajbari",
    "category": "North Kolkata",
    "lat": 22.5971,
    "lng": 88.3632
  },
  {
    "name": "37 Pally",
    "category": "North Kolkata",
    "lat": 22.574,
    "lng": 88.368
  },
  {
    "name": "Salt Lake AJ Block",
    "category": "Salt Lake",
    "lat": 22.586,
    "lng": 88.403
  },
  {
    "name": "Laketown Nutan Palli",
    "category": "North Kolkata",
    "lat": 22.606,
    "lng": 88.396
  },
  {
    "name": "Pradeep Sangha",
    "category": "North Kolkata",
    "lat": 22.5815,
    "lng": 88.3675
  },
  {
    "name": "Rammohan Sammilani",
    "category": "North Kolkata",
    "lat": 22.5725,
    "lng": 88.3665
  },
  {
    "name": "Durga Puja of 4 Ghosh Lane",
    "category": "North Kolkata",
    "lat": 22.5885,
    "lng": 88.3685
  },
  {
    "name": "Dakshineswar Dolpere Adi Sabojonin Durgapuja",
    "category": "North Kolkata",
    "lat": 22.65,
    "lng": 88.37
  },
  {
    "name": "Milangarh Sarbojanin",
    "category": "North Kolkata",
    "lat": 22.625,
    "lng": 88.39
  },
  {
    "name": "Motijheel Sarbojanin",
    "category": "North Kolkata",
    "lat": 22.628,
    "lng": 88.392
  },
  {
    "name": "Beliaghata Nabamilan",
    "category": "North Kolkata",
    "lat": 22.563,
    "lng": 88.396
  },
  {
    "name": "Sandhani",
    "category": "North Kolkata",
    "lat": 22.571,
    "lng": 88.378
  },
  {
    "name": "Simla Byam Samity",
    "category": "North Kolkata",
    "lat": 22.586,
    "lng": 88.367
  },
  {
    "name": "United Club",
    "category": "North Kolkata",
    "lat": 22.568,
    "lng": 88.372
  },
  {
    "name": "Jagat Mukherjee Park",
    "category": "North Kolkata",
    "lat": 22.596,
    "lng": 88.369
  },
  {
    "name": "Baghbazar Pally",
    "category": "North Kolkata",
    "lat": 22.603150,
    "lng": 88.366900
  },
  {
    "name": "Beadon Street Sarbojanin",
    "category": "North Kolkata",
    "lat": 22.585,
    "lng": 88.365
  },
  {
    "name": "Sammilita Malapara",
    "category": "North Kolkata",
    "lat": 22.5825,
    "lng": 88.366
  },
  {
    "name": "Darpanarayan Tagore Street Pally Samity",
    "category": "North Kolkata",
    "lat": 22.5835,
    "lng": 88.364
  },
  {
    "name": "Haritaki Bagan",
    "category": "North Kolkata",
    "lat": 22.5865,
    "lng": 88.3635
  },
  {
    "name": "Sovabazar Sarbojonin",
    "category": "North Kolkata",
    "lat": 22.5955,
    "lng": 88.3635
  },
  {
    "name": "Hatkhola Gosain Para",
    "category": "North Kolkata",
    "lat": 22.5991,
    "lng": 88.356729
  },
  {
    "name": "Laketown Vivekananda Park",
    "category": "North Kolkata",
    "lat": 22.608,
    "lng": 88.398
  },
  {
    "name": "Jawpur Bayam Samiti",
    "category": "North Kolkata",
    "lat": 22.62,
    "lng": 88.39
  },
  {
    "name": "Pragati Pally Adhibasi Brindra",
    "category": "North Kolkata",
    "lat": 22.604,
    "lng": 88.394
  },
  {
    "name": "Kabiraj Bagan",
    "category": "North Kolkata",
    "lat": 22.587,
    "lng": 88.3695
  },
  {
    "name": "Murari Pukur Bidhan Sangha",
    "category": "North Kolkata",
    "lat": 22.5935,
    "lng": 88.382
  },
  {
    "name": "Salt Lake AD Block",
    "category": "Salt Lake",
    "lat": 22.589,
    "lng": 88.408
  },
  {
    "name": "Salt Lake AG Block",
    "category": "Salt Lake",
    "lat": 22.584,
    "lng": 88.406
  },
  {
    "name": "Sangrami",
    "category": "North Kolkata",
    "lat": 22.5795,
    "lng": 88.381
  },
  {
    "name": "Tarun Sporting Club",
    "category": "North Kolkata",
    "lat": 22.581,
    "lng": 88.383
  },
  {
    "name": "Shimla Vivekananda Sporting Club",
    "category": "North Kolkata",
    "lat": 22.5852,
    "lng": 88.3672
  },
  {
    "name": "Shurir Bagan",
    "category": "North Kolkata",
    "lat": 22.5842,
    "lng": 88.3682
  },
  {
    "name": "Salt Lake CA Block",
    "category": "Salt Lake",
    "lat": 22.598,
    "lng": 88.405
  },
  {
    "name": "Salt Lake BG Block",
    "category": "Salt Lake",
    "lat": 22.588,
    "lng": 88.418
  },
  {
    "name": "Salt Lake AH Block",
    "category": "Salt Lake",
    "lat": 22.582,
    "lng": 88.404
  },
  {
    "name": "Park Circus",
    "category": "South Kolkata",
    "lat": 22.545,
    "lng": 88.367
  },
  {
    "name": "Maddox Square",
    "category": "South Kolkata",
    "lat": 22.5332,
    "lng": 88.3551
  },
  {
    "name": "Deshapriya Park",
    "category": "South Kolkata",
    "lat": 22.5222,
    "lng": 88.3533
  },
  {
    "name": "41 Pally",
    "category": "South Kolkata",
    "lat": 22.5165,
    "lng": 88.3505
  },
  {
    "name": "Ajeya Sanghati",
    "category": "South Kolkata",
    "lat": 22.5095,
    "lng": 88.3515
  },
  {
    "name": "Vivekananda Sporting Club",
    "category": "South Kolkata",
    "lat": 22.513,
    "lng": 88.349
  },
  {
    "name": "Vivekananda Park Athletic Club",
    "category": "South Kolkata",
    "lat": 22.531,
    "lng": 88.354
  },
  {
    "name": "25 Pally",
    "category": "South Kolkata",
    "lat": 22.5185,
    "lng": 88.3485
  },
  {
    "name": "Mukul Sangha",
    "category": "South Kolkata",
    "lat": 22.5215,
    "lng": 88.3475
  },
  {
    "name": "66 Palli",
    "category": "South Kolkata",
    "lat": 22.518,
    "lng": 88.349
  },
  {
    "name": "Hindustan Park",
    "category": "South Kolkata",
    "lat": 22.518,
    "lng": 88.363
  },
  {
    "name": "Adi Lake Palli",
    "category": "South Kolkata",
    "lat": 22.514,
    "lng": 88.36
  },
  {
    "name": "Azadgarh",
    "category": "South Kolkata",
    "lat": 22.4865,
    "lng": 88.3605
  },
  {
    "name": "Bharat Mata",
    "category": "South Kolkata",
    "lat": 22.5155,
    "lng": 88.3565
  },
  {
    "name": "Golfgreen Phase 2",
    "category": "South Kolkata",
    "lat": 22.4955,
    "lng": 88.3685
  },
  {
    "name": "Santoshpur Trikon Park",
    "category": "South Kolkata",
    "lat": 22.502,
    "lng": 88.376
  },
  {
    "name": "Yuba Sangha Club",
    "category": "South Kolkata",
    "lat": 22.5045,
    "lng": 88.3585
  },
  {
    "name": "Netaji Nagar Sarbojanin",
    "category": "South Kolkata",
    "lat": 22.482,
    "lng": 88.358
  },
  {
    "name": "Netaji Jatiya Sebadal",
    "category": "South Kolkata",
    "lat": 22.4835,
    "lng": 88.359
  },
  {
    "name": "New Alipore Children's Park",
    "category": "South Kolkata",
    "lat": 22.505,
    "lng": 88.342
  },
  {
    "name": "Pally Mangal Samity",
    "category": "South Kolkata",
    "lat": 22.506,
    "lng": 88.371
  },
  {
    "name": "Poddar Nagar Park",
    "category": "South Kolkata",
    "lat": 22.492,
    "lng": 88.367
  },
  {
    "name": "Chakraberia Sarbojanin",
    "category": "South Kolkata",
    "lat": 22.535,
    "lng": 88.358
  },
  {
    "name": "Babubagan Club",
    "category": "South Kolkata",
    "lat": 22.509,
    "lng": 88.384
  },
  {
    "name": "Barisha Tarun Tirtha",
    "category": "South Kolkata",
    "lat": 22.4895,
    "lng": 88.3275
  },
  {
    "name": "74 Pally",
    "category": "South Kolkata",
    "lat": 22.517,
    "lng": 88.35
  },
  {
    "name": "Kabitirtha",
    "category": "South Kolkata",
    "lat": 22.538,
    "lng": 88.33
  },
  {
    "name": "Pally Saradiya Club",
    "category": "South Kolkata",
    "lat": 22.5118,
    "lng": 88.3598
  },
  {
    "name": "Behala 29 Palli",
    "category": "South Kolkata",
    "lat": 22.496,
    "lng": 88.331
  },
  {
    "name": "Baishnabghata Patuli Upanagari",
    "category": "South Kolkata",
    "lat": 22.475,
    "lng": 88.388
  },
  {
    "name": "Kendua Shanti Sangha - Patuli",
    "category": "South Kolkata",
    "lat": 22.473,
    "lng": 88.386
  },
  {
    "name": "Falguni Sangha",
    "category": "South Kolkata",
    "lat": 22.505,
    "lng": 88.36
  },
  {
    "name": "Chetla Agrani Club",
    "category": "South Kolkata",
    "lat": 22.5201,
    "lng": 88.3392
  },
  {
    "name": "Chelta Sarbasadharaner Club",
    "category": "South Kolkata",
    "lat": 22.519,
    "lng": 88.341
  },
  {
    "name": "Selimpur Naskarpara",
    "category": "South Kolkata",
    "lat": 22.503,
    "lng": 88.3735
  },
  {
    "name": "Bengal United Club",
    "category": "South Kolkata",
    "lat": 22.527,
    "lng": 88.3525
  },
  {
    "name": "Chandranath Chatterjee Street",
    "category": "South Kolkata",
    "lat": 22.524,
    "lng": 88.3515
  },
  {
    "name": "Greenwood Nook",
    "category": "South Kolkata",
    "lat": 22.57,
    "lng": 88.415
  },
  {
    "name": "Udayan Sangha",
    "category": "South Kolkata",
    "lat": 22.4845,
    "lng": 88.364
  },
  {
    "name": "Uttar Panchanan Gram Milan",
    "category": "South Kolkata",
    "lat": 22.512,
    "lng": 88.39
  },
  {
    "name": "Golden Arrow Club",
    "category": "South Kolkata",
    "lat": 22.5085,
    "lng": 88.373
  },
  {
    "name": "Purbachal Shakti Sangha",
    "category": "Salt Lake",
    "lat": 22.5915,
    "lng": 88.3965
  },
  {
    "name": "Naskarpur Sarbojanin",
    "category": "South Kolkata",
    "lat": 22.481,
    "lng": 88.345
  },
  {
    "name": "Kolkata",
    "category": "North Kolkata",
    "lat": 22.5726,
    "lng": 88.3639
  },
  {
    "name": "64 Pally",
    "category": "South Kolkata",
    "lat": 22.516,
    "lng": 88.347
  },
  {
    "name": "95 Pally",
    "category": "South Kolkata",
    "lat": 22.51,
    "lng": 88.367
  },
  {
    "name": "Bandhab Sammilani",
    "category": "South Kolkata",
    "lat": 22.526,
    "lng": 88.348
  },
  {
    "name": "The Bengal Boys Training Association",
    "category": "South Kolkata",
    "lat": 22.528,
    "lng": 88.35
  },
  {
    "name": "Nepal Bhattacharjee Street",
    "category": "South Kolkata",
    "lat": 22.52,
    "lng": 88.346
  },
  {
    "name": "Roynagar Unnayan Samity",
    "category": "South Kolkata",
    "lat": 22.4805,
    "lng": 88.3635
  },
  {
    "name": "Shyamapally Shyama Sangha",
    "category": "South Kolkata",
    "lat": 22.49,
    "lng": 88.375
  },
  {
    "name": "Garia Sreerampur Kalyan Samity",
    "category": "South Kolkata",
    "lat": 22.468,
    "lng": 88.39
  },
  {
    "name": "Bhowanipur Swadhin Sangha",
    "category": "South Kolkata",
    "lat": 22.532,
    "lng": 88.348
  },
  {
    "name": "Dakshin Phalguni Club",
    "category": "South Kolkata",
    "lat": 22.474,
    "lng": 88.385
  },
  {
    "name": "Garia Pancha Durga",
    "category": "South Kolkata",
    "lat": 22.469,
    "lng": 88.391
  },
  {
    "name": "Garia Sabuj Dal",
    "category": "South Kolkata",
    "lat": 22.467,
    "lng": 88.389
  },
  {
    "name": "Harish Park Puja",
    "category": "South Kolkata",
    "lat": 22.534,
    "lng": 88.352
  },
  {
    "name": "Jatra Suru Sangha",
    "category": "South Kolkata",
    "lat": 22.5138,
    "lng": 88.3465
  },
  {
    "name": "Judge Bagan Recreation Club",
    "category": "South Kolkata",
    "lat": 22.476,
    "lng": 88.352
  },
  {
    "name": "Green Avenue Sarbojanin",
    "category": "South Kolkata",
    "lat": 22.472,
    "lng": 88.38
  },
  {
    "name": "Rupchand Mukherjee Lane Sarbojanin",
    "category": "South Kolkata",
    "lat": 22.5285,
    "lng": 88.3465
  },
  {
    "name": "Santoshpur Agragami",
    "category": "South Kolkata",
    "lat": 22.499,
    "lng": 88.3775
  },
  {
    "name": "Santoshpur Bibekananda Sangha",
    "category": "South Kolkata",
    "lat": 22.4965,
    "lng": 88.3765
  },
  {
    "name": "Lake Pally Sarbojanin",
    "category": "South Kolkata",
    "lat": 22.5168,
    "lng": 88.359
  },
  {
    "name": "Golfgreen Phase 1",
    "category": "South Kolkata",
    "lat": 22.4975,
    "lng": 88.3675
  },
  {
    "name": "19 Pally",
    "category": "South Kolkata",
    "lat": 22.5172,
    "lng": 88.3512
  },
  {
    "name": "Kumartuli Preparation",
    "category": "North Kolkata",
    "lat": 22.5958,
    "lng": 88.3618
  },
  {
    "name": "Pally Unnayan Samity",
    "category": "South Kolkata",
    "lat": 22.5015,
    "lng": 88.3435
  },
  {
    "name": "Paschim Putiary",
    "category": "South Kolkata",
    "lat": 22.483,
    "lng": 88.341
  },
  {
    "name": "Naskarpara Pally Unnayan Samity - Haridevpur",
    "category": "South Kolkata",
    "lat": 22.4775,
    "lng": 88.3515
  },
  {
    "name": "Barisha Club",
    "category": "South Kolkata",
    "lat": 22.4875,
    "lng": 88.326
  },
  {
    "name": "Barisha Janakalyan Sangha",
    "category": "South Kolkata",
    "lat": 22.4845,
    "lng": 88.3225
  },
  {
    "name": "68 Pally",
    "category": "South Kolkata",
    "lat": 22.5178,
    "lng": 88.3498
  },
  {
    "name": "77 Palli",
    "category": "South Kolkata",
    "lat": 22.5162,
    "lng": 88.3508
  },
  {
    "name": "Abasarika Club",
    "category": "South Kolkata",
    "lat": 22.5052,
    "lng": 88.3588
  },
  {
    "name": "Bakul Bagan Sarbojanin",
    "category": "South Kolkata",
    "lat": 22.528,
    "lng": 88.355
  },
  {
    "name": "Haridevpur Adarsha Samiti",
    "category": "South Kolkata",
    "lat": 22.48,
    "lng": 88.348
  },
  {
    "name": "Hindustan Club",
    "category": "South Kolkata",
    "lat": 22.519,
    "lng": 88.356
  },
  {
    "name": "Manoharpukur Youngs",
    "category": "South Kolkata",
    "lat": 22.5265,
    "lng": 88.357
  },
  {
    "name": "Padmapukur Youth Association",
    "category": "South Kolkata",
    "lat": 22.5305,
    "lng": 88.3505
  },
  {
    "name": "Padmapukur Baroyari",
    "category": "South Kolkata",
    "lat": 22.5315,
    "lng": 88.3515
  },
  {
    "name": "Park Circus - Uddipani",
    "category": "South Kolkata",
    "lat": 22.544,
    "lng": 88.368
  },
  {
    "name": "Triangular Park Sarbojanin",
    "category": "South Kolkata",
    "lat": 22.5208,
    "lng": 88.3592
  },
  {
    "name": "Sitalatala Kishore Sangha",
    "category": "South Kolkata",
    "lat": 22.4985,
    "lng": 88.34
  },
  {
    "name": "Prasanta Disha Sarbojanin",
    "category": "South Kolkata",
    "lat": 22.4855,
    "lng": 88.354
  },
  {
    "name": "Barisha Yubak Brinda",
    "category": "South Kolkata",
    "lat": 22.4865,
    "lng": 88.324
  },
  {
    "name": "Aikya Sammilani",
    "category": "South Kolkata",
    "lat": 22.5125,
    "lng": 88.3485
  },
  {
    "name": "AC Block",
    "category": "Salt Lake",
    "lat": 22.591,
    "lng": 88.406
  },
  {
    "name": "AB Block",
    "category": "Salt Lake",
    "lat": 22.593,
    "lng": 88.404
  },
  {
    "name": "AA Block",
    "category": "Salt Lake",
    "lat": 22.592,
    "lng": 88.402
  },
  {
    "name": "AK Block",
    "category": "Salt Lake",
    "lat": 22.59,
    "lng": 88.409
  },
  {
    "name": "AE Block",
    "category": "Salt Lake",
    "lat": 22.588,
    "lng": 88.405
  },
  {
    "name": "AJ Block",
    "category": "Salt Lake",
    "lat": 22.586,
    "lng": 88.403
  },
  {
    "name": "AL Block",
    "category": "Salt Lake",
    "lat": 22.58,
    "lng": 88.402
  },
  {
    "name": "BA Block",
    "category": "Salt Lake",
    "lat": 22.595,
    "lng": 88.408
  },
  {
    "name": "BB Block",
    "category": "Salt Lake",
    "lat": 22.596,
    "lng": 88.41
  },
  {
    "name": "BC Block",
    "category": "Salt Lake",
    "lat": 22.594,
    "lng": 88.412
  },
  {
    "name": "BD Block",
    "category": "Salt Lake",
    "lat": 22.592,
    "lng": 88.414
  },
  {
    "name": "BE Block",
    "category": "Salt Lake",
    "lat": 22.59,
    "lng": 88.416
  },
  {
    "name": "BH Block",
    "category": "Salt Lake",
    "lat": 22.586,
    "lng": 88.416
  },
  {
    "name": "BJ Block",
    "category": "Salt Lake",
    "lat": 22.5921,
    "lng": 88.411
  },
  {
    "name": "BK Block",
    "category": "Salt Lake",
    "lat": 22.593,
    "lng": 88.413
  },
  {
    "name": "BL Block",
    "category": "Salt Lake",
    "lat": 22.595,
    "lng": 88.415
  },
  {
    "name": "CB Block",
    "category": "Salt Lake",
    "lat": 22.599,
    "lng": 88.407
  },
  {
    "name": "CD Block",
    "category": "Salt Lake",
    "lat": 22.597,
    "lng": 88.403
  },
  {
    "name": "CE Block",
    "category": "Salt Lake",
    "lat": 22.596,
    "lng": 88.401
  },
  {
    "name": "JC Block",
    "category": "Salt Lake",
    "lat": 22.578,
    "lng": 88.41
  },
  {
    "name": "IB Block",
    "category": "Salt Lake",
    "lat": 22.576,
    "lng": 88.408
  },
  {
    "name": "HB Block",
    "category": "Salt Lake",
    "lat": 22.574,
    "lng": 88.404
  },
  {
    "name": "HA Block",
    "category": "Salt Lake",
    "lat": 22.573,
    "lng": 88.402
  },
  {
    "name": "GC Block",
    "category": "Salt Lake",
    "lat": 22.571,
    "lng": 88.414
  },
  {
    "name": "FE Block",
    "category": "Salt Lake",
    "lat": 22.581,
    "lng": 88.416
  },
  {
    "name": "FC Block",
    "category": "Salt Lake",
    "alt": "Salt Lake",
    "lat": 22.583,
    "lng": 88.418
  },
  {
    "name": "EE Block",
    "category": "Salt Lake",
    "lat": 22.585,
    "lng": 88.42
  },
  {
    "name": "EC Market",
    "category": "Salt Lake",
    "lat": 22.587,
    "lng": 88.415
  },
  {
    "name": "DB Block",
    "category": "Salt Lake",
    "lat": 22.5895,
    "lng": 88.41
  },
  {
    "name": "DA Block",
    "category": "Salt Lake",
    "lat": 22.5905,
    "lng": 88.408
  },
  {
    "name": "CG Block",
    "category": "Salt Lake",
    "lat": 22.577,
    "lng": 88.403
  }
];
const uniquePujosMap = new Map();
rawPujos.forEach(pujo => {
    if (pujo && pujo.name) {
        const cleanName = pujo.name.trim().toLowerCase();
        if (!uniquePujosMap.has(cleanName)) {
            uniquePujosMap.set(cleanName, pujo);
        }
    }
});
export const allPandals = Array.from(uniquePujosMap.values());
console.log('Total unique pujo locations loaded:', allPandals.length);


export function parseLocationCoords(locStr) {
  if (!locStr || typeof locStr !== 'string') return null;
  
  // Format: @lat,lng or ?q=lat,lng or direct lat,lng (e.g., 22.5821, 88.3612)
  const regex = /([-+]?[0-9]{1,2}\.[0-9]{3,})[,\s]+([-+]?[0-9]{1,3}\.[0-9]{3,})/;
  const match = locStr.match(regex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  return null;
}

export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const NOISE_WORDS = new Set([
  'durga', 'puja', 'pujo', 'durgotsab', 'durgatsab', 'durgapuja',
  'sarbojanin', 'sarbojonin', 'sadharan', 'sarbasadharaner',
  'club', 'sangha', 'samiti', 'samity', 'committee', 'association',
  'barir', 'bari', 'er', 'the', 'and', 'part'
]);

export function cleanPandalName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w && !NOISE_WORDS.has(w))
    .join(' ')
    .trim();
}

export function checkPandalDuplicate(name, area, locationStr, coords) {
  if (!name || typeof name !== 'string') return { isDuplicate: false };

  const rawLower = name.trim().toLowerCase();
  const cleanedInput = cleanPandalName(name);

  // 1. Check direct or stemmed name matches
  for (const pandal of allPandals) {
    const pandalLower = pandal.name.trim().toLowerCase();
    if (pandalLower === rawLower) {
      return { isDuplicate: true, matchedPandal: pandal, reason: 'Exact name match' };
    }

    const cleanedPandal = cleanPandalName(pandal.name);
    if (cleanedInput && cleanedPandal) {
      if (cleanedInput === cleanedPandal) {
        return { isDuplicate: true, matchedPandal: pandal, reason: 'Similar name match' };
      }
      // If one contains the other and length is significant (> 4 chars)
      if (
        (cleanedInput.length >= 5 && cleanedPandal.includes(cleanedInput)) ||
        (cleanedPandal.length >= 5 && cleanedInput.includes(cleanedPandal))
      ) {
        return { isDuplicate: true, matchedPandal: pandal, reason: 'Name match' };
      }
    }
  }

  // 2. Check location coordinates proximity (< 120 meters)
  const targetCoords = coords && coords.lat && coords.lng 
    ? coords 
    : parseLocationCoords(locationStr);

  if (targetCoords && !isNaN(targetCoords.lat) && !isNaN(targetCoords.lng)) {
    for (const pandal of allPandals) {
      if (pandal.lat && pandal.lng) {
        const dist = getDistanceMeters(targetCoords.lat, targetCoords.lng, pandal.lat, pandal.lng);
        if (dist <= 120) {
          return { 
            isDuplicate: true, 
            matchedPandal: pandal, 
            distance: Math.round(dist),
            reason: 'A pandal already exists at this location on the map (' + Math.round(dist) + 'm away)'
          };
        }
      }
    }
  }

  return { isDuplicate: false };
}
