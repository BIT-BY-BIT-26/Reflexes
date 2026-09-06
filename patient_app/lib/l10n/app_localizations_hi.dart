// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Hindi (`hi`).
class AppLocalizationsHi extends AppLocalizations {
  AppLocalizationsHi([String locale = 'hi']) : super(locale);

  @override
  String get appName => 'MediReach';

  @override
  String get home => 'होम';

  @override
  String get appointments => 'अपॉइंटमेंट्स';

  @override
  String get profile => 'प्रोफ़ाइल';

  @override
  String get queue => 'कतार';

  @override
  String get nearbyHospitals => 'पास के अस्पताल';

  @override
  String get searchHospitals => 'अस्पताल खोजें';

  @override
  String get bookAppointment => 'अपॉइंटमेंट बुक करें';

  @override
  String get myAppointments => 'मेरी अपॉइंटमेंट्स';

  @override
  String get doctors => 'डॉक्टर';

  @override
  String get departments => 'विभाग';

  @override
  String get hospital => 'अस्पताल';

  @override
  String get viewDetails => 'विवरण देखें';

  @override
  String get selectDoctor => 'डॉक्टर चुनें';

  @override
  String get selectDepartment => 'विभाग चुनें';

  @override
  String get reasonForVisit => 'विज़िट का कारण';

  @override
  String get description => 'विवरण';

  @override
  String get confirmAppointment => 'अपॉइंटमेंट की पुष्टि करें';

  @override
  String get cancelAppointment => 'अपॉइंटमेंट रद्द करें';

  @override
  String get upcoming => 'आगामी';

  @override
  String get past => 'पिछली';

  @override
  String get profileSettings => 'प्रोफ़ाइल सेटिंग्स';

  @override
  String get language => 'भाषा';

  @override
  String get english => 'अंग्रेज़ी';

  @override
  String get hindi => 'हिंदी';

  @override
  String get marathi => 'मराठी';

  @override
  String get save => 'सेव करें';

  @override
  String get cancel => 'रद्द करें';

  @override
  String get done => 'हो गया';

  @override
  String get retry => 'पुनः प्रयास करें';

  @override
  String get loading => 'लोड हो रहा है...';

  @override
  String get noAppointments => 'कोई अपॉइंटमेंट नहीं मिली';

  @override
  String get somethingWentWrong => 'कुछ गलत हो गया';

  @override
  String get tryAgain => 'पुनः प्रयास करें';

  @override
  String get welcomeBack => 'वापसी पर स्वागत है';

  @override
  String get skipTheWait => 'इंतज़ार से बचें';

  @override
  String get bookWithEase => 'आसानी से बुक करें';

  @override
  String get bookAppointmentsQueue =>
      'अपॉइंटमेंट बुक करें और\nकतार को रियल टाइम में देखें';

  @override
  String get quickAccess => 'त्वरित पहुँच';

  @override
  String get findHospitals => 'अस्पताल खोजें';

  @override
  String get topDoctors => 'शीर्ष डॉक्टर';

  @override
  String get emergency => 'आपातकाल';

  @override
  String get pharmacy => 'फार्मेसी';

  @override
  String get viewAll => 'सभी देखें';

  @override
  String get noHospitalsFoundNearby => 'आस-पास कोई अस्पताल नहीं मिला';

  @override
  String get availableNow => 'अभी उपलब्ध';

  @override
  String get currentlyUnavailable => 'अभी उपलब्ध नहीं';

  @override
  String kmAway(Object distance) {
    return '$distance किमी दूर';
  }
}
