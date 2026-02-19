import 'dart:convert';

bool isTokenExpired(String token) {
  final parts = token.split('.');
  final payload = jsonDecode(
    utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
  );

  final expiry =
      DateTime.fromMillisecondsSinceEpoch(payload['exp'] * 1000);

  return DateTime.now().isAfter(expiry);
}
