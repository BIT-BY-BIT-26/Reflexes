import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:patient_app/features/voice_assistant/services/voice_assistant_service.dart';
import 'package:patient_app/models/voice_message_model.dart';
import 'package:record/record.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum VoiceStatus { idle, waking, listening, processing, speaking, error }

class VoiceAssistantProvider with ChangeNotifier {
  static const _sessionKey = 'voice_session_id';

  /// The web client defaults to this id, and the backend has a patient row for
  /// it. Used only when nobody is logged in, so the screen still demos.
  static const _fallbackPatientId = '3';

  /// 16 kHz mono is what speech-to-text wants anyway, and it keeps uploads
  /// small on mobile data.
  static const _recordConfig = RecordConfig(
    encoder: AudioEncoder.aacLc,
    bitRate: 64000,
    sampleRate: 16000,
    numChannels: 1,
    echoCancel: true,
    noiseSuppress: true,
  );

  final VoiceAssistantService _service = VoiceAssistantService();
  final AudioRecorder _recorder = AudioRecorder();
  final AudioPlayer _player = AudioPlayer();

  VoiceStatus status = VoiceStatus.idle;
  String? errorMessage;
  List<VoiceMessage> messages = [];

  /// True between "Start" and "End" — this is what makes the assistant loop
  /// back into listening after it finishes speaking.
  bool conversationActive = false;

  String _patientId = _fallbackPatientId;
  String _sessionId = '';
  String? _recordingPath;
  String? _replyPath;
  StreamSubscription<void>? _completeSub;
  bool _disposed = false;
  bool _initialised = false;

  VoiceAssistantProvider() {
    _player.setReleaseMode(ReleaseMode.stop);
    _completeSub = _player.onPlayerComplete.listen((_) {
      if (conversationActive) {
        _startRecording();
      } else {
        _set(VoiceStatus.idle);
      }
    });
  }

  void _set(VoiceStatus next, {String? error}) {
    if (_disposed) return;
    status = next;
    errorMessage = error;
    notifyListeners();
  }

  void _addMessage(VoiceRole role, String text) {
    if (_disposed || text.trim().isEmpty) return;
    messages.add(VoiceMessage(role: role, text: text.trim()));
    notifyListeners();
  }

  Future<void> init({String? patientId}) async {
    if (_initialised) return;
    _initialised = true;

    _patientId = patientId ?? _fallbackPatientId;

    // Keep the session stable across restarts so the backend can continue the
    // same conversation, mirroring the web client's localStorage behaviour.
    final prefs = await SharedPreferences.getInstance();
    var saved = prefs.getString(_sessionKey);
    if (saved == null) {
      saved = "session-$_patientId-${DateTime.now().millisecondsSinceEpoch}";
      await prefs.setString(_sessionKey, saved);
    }
    _sessionId = saved;

    _set(VoiceStatus.waking);
    await _service.warmUp();
    if (status == VoiceStatus.waking) _set(VoiceStatus.idle);
  }

  Future<void> startConversation() async {
    if (!await _recorder.hasPermission()) {
      _set(VoiceStatus.error, error: "Microphone permission denied");
      return;
    }
    conversationActive = true;
    await _startRecording();
  }

  Future<void> _startRecording() async {
    if (_disposed || !conversationActive) return;
    try {
      final dir = await getTemporaryDirectory();
      _recordingPath =
          "${dir.path}/voice_input_${DateTime.now().millisecondsSinceEpoch}.m4a";
      await _recorder.start(_recordConfig, path: _recordingPath!);
      _set(VoiceStatus.listening);
    } catch (e) {
      _set(VoiceStatus.error, error: "Could not start recording");
    }
  }

  /// Stops recording and sends what was captured. This is the "Stop Speaking"
  /// action from the web client.
  Future<void> stopAndSend() async {
    if (status != VoiceStatus.listening) return;

    final path = await _recorder.stop();
    if (path == null) {
      _set(VoiceStatus.error, error: "Nothing was recorded");
      return;
    }

    _set(VoiceStatus.processing);
    try {
      final reply = await _service.sendAudio(
        patientId: _patientId,
        sessionId: _sessionId,
        audio: File(path),
      );
      _addMessage(VoiceRole.user, reply.transcript ?? "");
      _addMessage(VoiceRole.assistant, reply.reply);
      await _handleReplyAudio(reply.audio);
    } catch (e) {
      _set(VoiceStatus.error, error: "Something went wrong. Tap to retry.");
    } finally {
      _deleteFile(path);
      _recordingPath = null;
    }
  }

  Future<void> sendTypedMessage(String message) async {
    if (message.trim().isEmpty) return;
    if (status == VoiceStatus.processing) return;

    // A half-finished recording is meaningless once the patient types instead.
    if (status == VoiceStatus.listening) {
      await _recorder.cancel();
    }
    await _player.stop();

    _addMessage(VoiceRole.user, message);
    _set(VoiceStatus.processing);
    try {
      final reply = await _service.sendText(
        patientId: _patientId,
        sessionId: _sessionId,
        message: message.trim(),
      );
      _addMessage(VoiceRole.assistant, reply.reply);
      await _handleReplyAudio(reply.audio);
    } catch (e) {
      _set(VoiceStatus.error, error: "Something went wrong. Tap to retry.");
    }
  }

  Future<void> _handleReplyAudio(Uint8List? audio) async {
    // The text endpoint returns no audio, so fall straight back to listening.
    if (audio == null || audio.isEmpty) {
      if (conversationActive) {
        await _startRecording();
      } else {
        _set(VoiceStatus.idle);
      }
      return;
    }

    final dir = await getTemporaryDirectory();
    final path =
        "${dir.path}/voice_reply_${DateTime.now().millisecondsSinceEpoch}.mp3";
    await File(path).writeAsBytes(audio, flush: true);

    _deleteFile(_replyPath);
    _replyPath = path;

    _set(VoiceStatus.speaking);
    await _player.play(DeviceFileSource(path));
  }

  /// Skips the assistant's playback and goes straight back to listening.
  Future<void> skipPlayback() async {
    if (status != VoiceStatus.speaking) return;
    await _player.stop();
    if (conversationActive) {
      await _startRecording();
    } else {
      _set(VoiceStatus.idle);
    }
  }

  Future<void> endConversation() async {
    conversationActive = false;
    if (await _recorder.isRecording()) {
      await _recorder.cancel();
    }
    await _player.stop();
    _set(VoiceStatus.idle);
  }

  void _deleteFile(String? path) {
    if (path == null) return;
    try {
      final file = File(path);
      if (file.existsSync()) file.deleteSync();
    } catch (_) {
      // temp files, not worth failing over
    }
  }

  @override
  void dispose() {
    _disposed = true;
    conversationActive = false;
    _completeSub?.cancel();
    _recorder.dispose();
    _player.dispose();
    _deleteFile(_recordingPath);
    _deleteFile(_replyPath);
    super.dispose();
  }
}
