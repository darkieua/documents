<?php
namespace AppBundle\Controller;

use AppBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Serializer\Encoder\JsonEncoder;

class SecurityController extends Controller
{
    /**
     * @Route("/login", name="login")
     */
    public function authAction($key = '')
    {
        if (!$key) {
            $request = Request::createFromGlobals();
            $key = $request->query->get('key');
        }
        $url = $this->getParameter('cabinet_url') . 'api/getperson?key=' . $key;
        $response = file_get_contents($url);
        $elements = (new JsonEncoder())->decode($response, 'json');
        $manager = $this->getDoctrine()->getManager();
        if ($elements['status'] == 'OK') {
            $user = $manager->getRepository('AppBundle:User')->find($elements['result']['guid']);
            $session = new Session();
            $session->set('user_guid', $elements['result']['guid']);
            $session->set('user_name', $elements['result']['name']);
            $session->set('user_surname', $elements['result']['surname']);
            $session->set('user_patronymic', $elements['result']['patronymic']);
            $session->set('user_email', $elements['result']['email']);
            if ($user) {
                $token = new UsernamePasswordToken($user, '', 'main');
                $this->get('security.token_storage')->setToken($token);
                //$this->get('security.token_storage')->getToken()->setUser($user);
                //$this->get('security.token_storage')->getToken()->setAuthenticated(true);
                if ($session->get('user_name'))
                    //return new Response("User: " . $session->get('user_name'));
                    return $this->forward('AppBundle:List:list');
            } else {
                $user = new User($elements['result']['guid']);
                $manager->persist($user);
                $manager->flush();
                return $this->forward('AppBundle:List:list');
            }
        } else if ($elements['status'] == 'ERROR_CABINET') {
            $session = new Session();
            $session->set('user_guid', null);
            $session->set('user_name', null);
            $session->set('user_surname', null);
            $session->set('user_patronymic', null);
            $session->set('user_email', null);
            $this->get('security.token_storage')->setToken(null);
            return $this->forward('AppBundle:List:list', array('error' => $key));
        }
    }
}

?>