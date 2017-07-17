/***************************************************************************************************
 * Educational Online Test Delivery System
 * Copyright (c) 2017 Regents of the University of California
 *
 * Distributed under the AIR Open Source License, Version 1.0
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 *
 * SmarterApp Open Source Assessment Software Project: http://smarterapp.org
 * Developed by Fairway Technologies, Inc. (http://fairwaytech.com)
 * for the Smarter Balanced Assessment Consortium (http://smarterbalanced.org)
 **************************************************************************************************/

package tds.itemrenderer.security;

import TDS.Shared.Security.IEncryption;
import TDS.Shared.Security.TDSEncryptionException;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import javax.xml.bind.DatatypeConverter;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.InvalidParameterSpecException;
import java.security.spec.KeySpec;

import static java.nio.charset.StandardCharsets.UTF_8;

@Component
public class Encryption implements IEncryption {
    public static final int MINIMUM_KEY_LENGTH = 24;
    private static final Logger log = LoggerFactory.getLogger(Encryption.class);
    private static final byte[] PBE_SALT = {(byte) 0xC1, (byte) 0x24, (byte) 0x5B, (byte) 0x9A, (byte) 0x17, (byte) 0x62, (byte) 0xF4, (byte) 0x80};
    private static final int PBE_NUM_ITERATIONS = 1000;
    private static final int PBE_KEY_LENGTH = 128;
    private static final int IV_LENGTH = 16;
    private static final String CIPHER_ALGORITHM = "AES";
    private static final String PBE_KEY_ALGORITHM = "PBKDF2WithHmacSHA1";
    private static final String TRANSFORMATION = "AES/CBC/PKCS5Padding";

    private final String encryptionKey;
    private Cipher encryptCipher;
    private Cipher decryptCipher;
    private SecretKey secretKey;

    @Autowired
    public Encryption(final String encryptionKey) {
        this.encryptionKey = encryptionKey;
    }

    /**
     * initializes ciphers and adds jce provider if provided
     *
     * @throws TDS.Shared.Security.TDSEncryptionException
     */
    @PostConstruct
    protected void init() {
        if (encryptionKey == null || StringUtils.isBlank(encryptionKey) || encryptionKey.length() < MINIMUM_KEY_LENGTH) {
            throw new TDSEncryptionException(String.format("Number of characters for key must be greater than %s", MINIMUM_KEY_LENGTH));
        }

        try {
            SecretKeyFactory secretKeyFactory = SecretKeyFactory.getInstance(PBE_KEY_ALGORITHM);
            KeySpec keySpec = new PBEKeySpec(encryptionKey.toCharArray(), PBE_SALT, PBE_NUM_ITERATIONS, PBE_KEY_LENGTH);
            SecretKey secretKeyTemp;
            secretKeyTemp = secretKeyFactory.generateSecret(keySpec);
            secretKey = new SecretKeySpec(secretKeyTemp.getEncoded(), CIPHER_ALGORITHM);
            encryptCipher = Cipher.getInstance(TRANSFORMATION);
            decryptCipher = Cipher.getInstance(TRANSFORMATION);
            encryptCipher.init(Cipher.ENCRYPT_MODE, secretKey);
        } catch (NoSuchAlgorithmException e) {
            log.error("Encyption.initCipher: " + e.getMessage(), e);
            throw new TDSEncryptionException("Algorithm is not available");
        } catch (InvalidKeySpecException e) {
            log.error("Encyption.initCipher: " + e.getMessage(), e);
            throw new TDSEncryptionException("Key specification is not valid");
        } catch (NoSuchPaddingException e) {
            log.error("Encyption.initCipher: " + e.getMessage(), e);
            throw new TDSEncryptionException("Padding is not valid");
        } catch (InvalidKeyException e) {
            log.error("Encyption.initCipher: " + e.getMessage(), e);
            throw new TDSEncryptionException("Key is not valid");
        }
    }

    @Override
    public String scrambleText(final String stringToEncrypt) throws TDSEncryptionException {
        return encrypt(stringToEncrypt);
    }

    private synchronized String encrypt(final String stringToEncrypt) {
        try {
            byte[] plainBytes = stringToEncrypt.getBytes(UTF_8);
            byte[] encryptedBytes = encryptCipher.doFinal(plainBytes);
            byte[] encryptIv = encryptCipher.getParameters().getParameterSpec(IvParameterSpec.class).getIV();
            byte[] cipherText = new byte[encryptedBytes.length + encryptIv.length];
            System.arraycopy(encryptIv, 0, cipherText, 0, encryptIv.length);
            System.arraycopy(encryptedBytes, 0, cipherText, encryptIv.length, encryptedBytes.length);
            return DatatypeConverter.printBase64Binary(cipherText);
        } catch (IllegalBlockSizeException e) {
            log.error("Encyption.encrypt: " + e.getMessage(), e);
            throw new TDSEncryptionException("Block Size is not valid");
        } catch (BadPaddingException e) {
            log.error("Encyption.encrypt: " + e.getMessage(), e);
            throw new TDSEncryptionException("Padding is not valid");
        } catch (InvalidParameterSpecException e) {
            log.error("Encyption.encrypt: " + e.getMessage(), e);
            throw new TDSEncryptionException("Parameter Sepcification is not valid");
        }
    }

    @Override
    public String unScrambleText(final String stringToDecrypt) throws TDSEncryptionException {
        return decrypt(stringToDecrypt);
    }

    private synchronized String decrypt(final String stringToDecrypt) {
        try {
            if (StringUtils.isEmpty(stringToDecrypt)) {
                return "";
            }

            byte[] encryptedBytes = DatatypeConverter.parseBase64Binary(stringToDecrypt);

            byte[] iv = new byte[IV_LENGTH];
            System.arraycopy(encryptedBytes, 0, iv, 0, iv.length);
            decryptCipher.init(Cipher.DECRYPT_MODE, secretKey, new IvParameterSpec(iv));
            byte[] cipherBytes = new byte[encryptedBytes.length - IV_LENGTH];
            System.arraycopy(encryptedBytes, IV_LENGTH, cipherBytes, 0, cipherBytes.length);
            byte[] decryptedBytes = decryptCipher.doFinal(cipherBytes);
            return new String(decryptedBytes, UTF_8);
        } catch (InvalidAlgorithmParameterException e) {
            log.error("Encyption.decrypt: " + e.getMessage(), e);
            throw new TDSEncryptionException("Algorithm is not valid");
        } catch (InvalidKeyException e) {
            log.error("Encyption.decrypt: " + e.getMessage(), e);
            throw new TDSEncryptionException("Key is not valid");
        } catch (IllegalBlockSizeException e) {
            log.error("Encyption.decrypt: " + e.getMessage(), e);
            throw new TDSEncryptionException("Block size is not valid");
        } catch (BadPaddingException e) {
            log.error("Encyption.decrypt: " + e.getMessage(), e);
            throw new TDSEncryptionException("Padding is not valid");
        }
    }
}
