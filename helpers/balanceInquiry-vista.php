<?php

class Inquiry {
        private $apiKey;
        private $apiUser;
        private $apiUrl;

        public function __construct($apiKey, $apiUser)
        {
                // Development or prod
                $development = strtolower(getenv('development')) === 'true';
                $staging = strtolower(getenv('staging')) === 'true';
                if ($staging) {
                  $url = 'https://52.36.46.10:8080';
                } else if ($development) {
                  $url = 'http://localhost:8080';
                } else {
                  $url = 'https://35.161.219.185:8080';
                }
                $this->apiKey = $apiKey;
                $this->apiUser = $apiUser;
                $this->apiUrl = $url;
        }

        private function getHeader($method,$contentType, $servicePath,$data){
                $date = new DateTime('now', new DateTimeZone('UTC'));
                $date = $date->format(DateTime::RFC2822);
                $authorization = $this->getAuthorization($method,$contentType, $servicePath,$data, $date);
                $headers = array(
                    'Authorization: ' . $authorization . '',
                    'Date: ' . $date . '',
                    'Content-Type: ' . $contentType . ''
                );
                return $headers;
        }

        private function response($method='GET',$servicePath,$contentType='', $data=''){
                if ($data) {
                        $data = http_build_query($data);
                }
                $headers = $this->getHeader($method,$contentType, $servicePath,$data);
                $curl = curl_init();
                curl_setopt($curl, CURLOPT_URL, $this->apiUrl.$servicePath);
                curl_setopt($curl, CURLOPT_POST, 1);
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($curl, CURLOPT_HEADER, true);
                curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
                curl_setopt($curl, CURLINFO_HEADER_OUT, false);
                curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
                curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
                curl_setopt($curl, CURLOPT_TIMEOUT, 120);

                $response = curl_exec($curl);

                $http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);

                if ($http_code == 200) {
                        // json format
                        $result = $response;
                } else {
                        // Get error msg
                        $http_message = curl_error($curl);

                        $result = $http_message;

                }
                curl_close($curl);
                return $result;
        }


        private function getAuthorization($method,$contentType, $servicePath,$data, $date)
        {
                $toSign = array($method, $contentType, $date, $data);
                $toSign = implode("\n", $toSign) . $servicePath;
                $signature = trim(base64_encode(hash_hmac('sha1', $toSign, $this->apiKey, true)));
                return "CFA" . " " . $this->apiUser . ":" . $signature;
        }

        public function checkGiftCardBalance($retailerId,$cardNumber,$pin)
        {
                $servicePath = '/api/giftcardbalance';
                $contentType = 'application/x-www-form-urlencoded';
                // Submitting the first way queries by card, the second way, by request ID
                $data = array(
                    // Normal
                    'retailerId' => $retailerId,
                    'cardNumber' => $cardNumber,
                    'pin'        => $pin,
                    // RequestID mode
                    // 'cardNumber' => $cardNumber
                );

                $result = $this->response('POST',$servicePath,$contentType,$data);
                $jsonStarts = strpos($result,'{');
                $res = json_decode(substr($result, $jsonStarts), true);
                if ($jsonStarts === false) {
                        return 'ERROR IN CHECK GIFTCARD BALANCE.';
                }

                return $res;
        }

        public function getGiftCardDelayBalance($requestId){
                $servicePath = "/api/giftcardbalance/" . $requestId;
                $result = $this->response('GET',$servicePath);
                $jsonStarts = strpos($result,'{');
                $res = json_decode(substr($result, $jsonStarts), true);
                if ($jsonStarts === false) {
                        return 'ERROR IN GET GIFTCARD DELAY BALANCE';
                }
                return $res;
        }


}

//$inquiry = new Inquiry('Test123', 'test');
//$inquiry = new Inquiry('Nh1pwxKE8MatT9BbW0AznVS6GzdceELTCAVFzB6hZmNdAgMBAAGjggG5MIIBtTAfBgNVHSMEGDAWgBRraT1qGEJK', 'NVBAsTKFNl');
$inquiry = new Inquiry('2XfMLssQHGdkaxFleKObQ6vJ56bupTA36s6NGcjOs0b3mSeDNIAi9TcrDAbf39JgNWs1u801CvOV5ozrz95Bc9Ia', 'cGaWqPc7vs');

// Look for request ID
$requestId = null;
if (count($argv) === 2) {
  $requestId = $argv[1];
  echo json_encode($inquiry->getGiftCardDelayBalance($requestId));
  return;
}

list($script, $retailerId, $cardNumber) = $argv;
$pin = '';
// Supply PIN if one is given
if (array_key_exists(3, $argv)) {
  $pin = $argv[3];
}

if (!$retailerId || !$cardNumber) {
  throw new Exception('Retailer ID and card number must be supplied to this script');
}

echo json_encode($inquiry->checkGiftCardBalance($retailerId, $cardNumber, $pin));
return;
