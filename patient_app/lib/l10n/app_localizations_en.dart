// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'MediReach';

  @override
  String get home => 'Home';

  @override
  String get appointments => 'Appointments';

  @override
  String get profile => 'Profile';

  @override
  String get queue => 'Queue';

  @override
  String get nearbyHospitals => 'Nearby Hospitals';

  @override
  String get searchHospitals => 'Search Hospitals';

  @override
  String get bookAppointment => 'Book Appointment';

  @override
  String get myAppointments => 'My Appointments';

  @override
  String get doctors => 'Doctors';

  @override
  String get departments => 'Departments';

  @override
  String get hospital => 'Hospital';

  @override
  String get viewDetails => 'View Details';

  @override
  String get selectDoctor => 'Select Doctor';

  @override
  String get selectDepartment => 'Select Department';

  @override
  String get reasonForVisit => 'Reason for Visit';

  @override
  String get description => 'Description';

  @override
  String get confirmAppointment => 'Confirm Appointment';

  @override
  String get cancelAppointment => 'Cancel Appointment';

  @override
  String get upcoming => 'Upcoming';

  @override
  String get past => 'Past';

  @override
  String get profileSettings => 'Profile Settings';

  @override
  String get language => 'Language';

  @override
  String get english => 'English';

  @override
  String get hindi => 'Hindi';

  @override
  String get marathi => 'Marathi';

  @override
  String get save => 'Save';

  @override
  String get cancel => 'Cancel';

  @override
  String get done => 'Done';

  @override
  String get retry => 'Retry';

  @override
  String get loading => 'Loading...';

  @override
  String get noAppointments => 'No appointments found';

  @override
  String get somethingWentWrong => 'Something went wrong';

  @override
  String get tryAgain => 'Try Again';

  @override
  String get welcomeBack => 'Welcome Back';

  @override
  String get skipTheWait => 'Skip the Wait';

  @override
  String get bookWithEase => 'Book with Ease';

  @override
  String get bookAppointmentsQueue =>
      'Book appointments and\nmonitor queue in real time';

  @override
  String get quickAccess => 'Quick access';

  @override
  String get findHospitals => 'Find Hospitals';

  @override
  String get topDoctors => 'Top Doctors';

  @override
  String get emergency => 'Emergency';

  @override
  String get pharmacy => 'Pharmacy';

  @override
  String get viewAll => 'View All';

  @override
  String get noHospitalsFoundNearby => 'No hospitals found nearby';

  @override
  String get availableNow => 'Available Now';

  @override
  String get currentlyUnavailable => 'Currently Unavailable';

  @override
  String kmAway(Object distance) {
    return '$distance km away';
  }
}
