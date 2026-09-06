enum VoiceRole { user, assistant }

class VoiceMessage {
  final VoiceRole role;
  final String text;

  VoiceMessage({required this.role, required this.text});

  bool get isUser => role == VoiceRole.user;
}
