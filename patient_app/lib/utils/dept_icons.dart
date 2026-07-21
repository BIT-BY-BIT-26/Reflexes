import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class DepartmentIcons {
  static const Map<String, FaIconData> icons = {
    "general medicine": FontAwesomeIcons.stethoscope,
    "general surgery": FontAwesomeIcons.userDoctor,
    "cardiology": FontAwesomeIcons.heartPulse,
    "neurology": FontAwesomeIcons.brain,
    "neurosurgery": FontAwesomeIcons.brain,
    "orthopedics": FontAwesomeIcons.bone,
    "pediatrics": FontAwesomeIcons.baby,
    "gynecology & obstetrics": FontAwesomeIcons.female,
    "dermatology": FontAwesomeIcons.handSparkles,
    "ent": FontAwesomeIcons.earListen,
    "ophthalmology": FontAwesomeIcons.eye,
    "urology": FontAwesomeIcons.droplet,
    "nephrology": FontAwesomeIcons.notesMedical,
    "gastroenterology": FontAwesomeIcons.notesMedical,
    "oncology": FontAwesomeIcons.ribbon,
    "pulmonology": FontAwesomeIcons.lungs,
    "endocrinology": FontAwesomeIcons.syringe,
    "psychiatry": FontAwesomeIcons.brain,
    "rheumatology": FontAwesomeIcons.handDots,
    "dentistry": FontAwesomeIcons.tooth,
    "physiotherapy": FontAwesomeIcons.dumbbell,
    "plastic surgery": FontAwesomeIcons.userDoctor,
    "anesthesiology": FontAwesomeIcons.syringe,
    "pain management": FontAwesomeIcons.handHoldingMedical,
    "allergy & immunology": FontAwesomeIcons.shieldVirus,
    "infectious diseases": FontAwesomeIcons.virus,
    "family medicine": FontAwesomeIcons.houseMedical,
    "geriatrics": FontAwesomeIcons.personCane,
    "sports medicine": FontAwesomeIcons.personRunning,
    "nutrition & dietetics": FontAwesomeIcons.appleWhole,
  };

  static FaIconData getIcon(String department) {
    final key = department.trim().toLowerCase();
    return icons[key] ?? FontAwesomeIcons.hospital;
  }
}