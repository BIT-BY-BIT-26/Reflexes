import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:patient_app/utils/constants.dart';

/// One reply from the voice assistant backend.
///
/// `transcript` is only present on the voice endpoint (the text endpoint has
/// nothing to transcribe), and `audio` is the decoded MP3 the backend returns
/// base64-encoded.
class VoiceReply {
  final String? transcript;
  final String reply;
  final Uint8List? audio;

  VoiceReply({this.transcript, required this.reply, this.audio});

  factory VoiceReply.fromJson(Map<String, dynamic> json) {
    final rawAudio = json['audio'];
    return VoiceReply(
      transcript: json['transcript'] as String?,
      reply: (json['response'] ?? "") as String,
      audio: (rawAudio is String && rawAudio.isNotEmpty)
          ? base64Decode(rawAudio)
          : null,
    );
  }
}

class VoiceAssistantService {
  /// The hosted service sleeps on Render's free tier, so the first request
  /// after an idle period pays a cold start of roughly a minute.
  static const Duration _timeout = Duration(seconds: 90);

  /// Note: this backend has no authentication, so no Bearer token is sent.
  Future<VoiceReply> sendAudio({
    required String patientId,
    required String sessionId,
    required File audio,
  }) async {
    final uri = Uri.parse("$voiceAgentBaseUrl/api/chat/voice");

    final request = http.MultipartRequest("POST", uri);
    request.fields['patient_id'] = patientId;
    request.fields['session_id'] = sessionId;
    request.files.add(
      await http.MultipartFile.fromPath(
        'file',
        audio.path,
        filename: 'speech.m4a',
        contentType: MediaType('audio', 'mp4'),
      ),
    );

    final streamed = await request.send().timeout(_timeout);
    final res = await http.Response.fromStream(streamed);

    if (res.statusCode != 200) {
      throw Exception("Voice assistant failed (${res.statusCode})");
    }

    return VoiceReply.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<VoiceReply> sendText({
    required String patientId,
    required String sessionId,
    required String message,
  }) async {
    final res = await http
        .post(
          Uri.parse("$voiceAgentBaseUrl/api/chat/"),
          headers: {"Content-Type": "application/json"},
          body: jsonEncode({
            "patient_id": patientId,
            "session_id": sessionId,
            "message": message,
          }),
        )
        .timeout(_timeout);

    if (res.statusCode != 200) {
      throw Exception("Voice assistant failed (${res.statusCode})");
    }

    return VoiceReply.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  /// Fire-and-forget ping so the Render instance is already awake by the time
  /// the patient actually speaks. Failures are irrelevant here.
  Future<void> warmUp() async {
    try {
      await http
          .get(Uri.parse(voiceAgentBaseUrl))
          .timeout(const Duration(seconds: 60));
    } catch (_) {
      // ignored on purpose
    }
  }
}
