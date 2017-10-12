<?php

class Inquiry {
        private $apiKey;
        private $apiUser;
        private $apiUrl = "https://api.cardquiry.com:8080";

        public function __construct($apiKey, $apiUser)
        {
                $this->apiKey = $apiKey;
                $this->apiUser = $apiUser;
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


        public function checkBalance(Card $card)
        {
                $servicePath = '/api/giftcardbalance';
                $contentType = 'application/x-www-form-urlencoded';
                $data = array(
                    'retailerId' => $card->getRetailer()->getId(),
                    'cardNumber' => $card->getNumber(),
                    'pin'        => $card->getPin(),
                );

                $result = $this->response('POST',$servicePath,$contentType,$data);
                $jsonStarts = strpos($result,'{');
                if ($jsonStarts === false) {
                        return 'Unknown Error. Try again.';
                }
                $res = json_decode(substr($result, $jsonStarts), true);
                if (isset($res['balance']) && $res['responseCode'] === '000') {
                        $card->setBalance($res['balance']);

                        return false;
                } else {
                        return $res['responseMessage'];
                }
        }

        public function checkGiftCardBalance($retailerId,$cardNumber,$pin)
        {
                $servicePath = '/api/giftcardbalance';
                $contentType = 'application/x-www-form-urlencoded';
                $data = array(
                    'retailerId' => $retailerId,
                    'cardNumber' => $cardNumber,
                    'pin'        => $pin,
                );

                $result = $this->response('POST',$servicePath,$contentType,$data);
                $jsonStarts = strpos($result,'{');
                $res = json_decode(substr($result, $jsonStarts), true);
                if ($jsonStarts === false) {
                        return 'Unknown Error. Try again.';
                }

                return $res;
        }

        public function getGiftCardDelayBalance($requestId){
                $servicePath = "/api/giftcardbalance/" . $requestId;
                $result = $this->response('GET',$servicePath);
                $jsonStarts = strpos($result,'{');
                $res = json_decode(substr($result, $jsonStarts), true);
                if ($jsonStarts === false) {
                        return 'Unknown Error. Try again.';
                }
                return $res;
        }


}

list($script, $retailerId, $cardNumber, $pin) = $argv;
if (!$retailerId || !$cardNumber || !$pin) {
  throw new Exception('Retailer ID, card number, and PIN must be supplied to this script');
}

$inquiry = new Inquiry('HHweoWuHDruEW5PVFtAlfnZwVWkIQEgOrxUPWagb5I4zAPS', 'MAwcY6S1');

echo json_encode($inquiry->checkGiftCardBalance($retailerId, $cardNumber, $pin));
