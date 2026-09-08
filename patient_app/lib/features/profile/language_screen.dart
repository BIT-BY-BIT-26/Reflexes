import 'package:flutter/material.dart';
import 'package:patient_app/l10n/app_localizations.dart';
import 'package:patient_app/providers/locale_provider.dart';
import 'package:provider/provider.dart';


class LanguageScreen extends StatelessWidget {
  const LanguageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeProvider = context.watch<LocaleProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.language),
      ),

      body: Column(
        children: [
          RadioListTile<Locale>(
            title: Text(l10n.english),
            value: const Locale('en'),
            groupValue: localeProvider.locale,
            onChanged: (locale) {
              if (locale != null) {
                context.read<LocaleProvider>().setLocale(locale);
              }
            },
          ),

          RadioListTile<Locale>(
            title: Text(l10n.hindi),
            value: const Locale('hi'),
            groupValue: localeProvider.locale,
            onChanged: (locale) {
              if (locale != null) {
                context.read<LocaleProvider>().setLocale(locale);
              }
            },
          ),

          RadioListTile<Locale>(
            title: Text(l10n.marathi),
            value: const Locale('mr'),
            groupValue: localeProvider.locale,
            onChanged: (locale) {
              if (locale != null) {
                context.read<LocaleProvider>().setLocale(locale);
              }
            },
          ),
        ],
      ),
    );
  }
}