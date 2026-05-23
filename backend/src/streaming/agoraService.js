const { RtcTokenBuilder, RtcRole } = require('agora-token');
require('dotenv').config();

class AgoraService {
  /**
   * Generate token for stream access
   */
  static generateToken(channelName, uid) {
    try {
      const appId = process.env.AGORA_APP_ID;
      const appCertificate = process.env.AGORA_APP_CERTIFICATE;

      if (!appId || !appCertificate) {
        throw new Error('Agora credentials not configured');
      }

      const expirationTimeInSeconds = 3600; // 1 hour
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      // Generate broadcaster token
      const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid,
        RtcRole.PUBLISHER,
        privilegeExpiredTs
      );

      return token;
    } catch (error) {
      console.error('Error generating Agora token:', error);
      throw error;
    }
  }

  /**
   * Generate viewer token
   */
  static generateViewerToken(channelName, uid) {
    try {
      const appId = process.env.AGORA_APP_ID;
      const appCertificate = process.env.AGORA_APP_CERTIFICATE;

      if (!appId || !appCertificate) {
        throw new Error('Agora credentials not configured');
      }

      const expirationTimeInSeconds = 3600;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      // Generate viewer token
      const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid,
        RtcRole.SUBSCRIBER,
        privilegeExpiredTs
      );

      return token;
    } catch (error) {
      console.error('Error generating viewer token:', error);
      throw error;
    }
  }
}

module.exports = AgoraService;
