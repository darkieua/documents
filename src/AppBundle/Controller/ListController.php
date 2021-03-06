<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Document;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class ListController extends Controller
{
    public function listAction($error = '')
    {
        $request = Request::createFromGlobals();
        $documents = $this->getDoctrine()->getRepository('AppBundle:Document')->findAll();
        return $this->render('document/list.html.twig', array('page_title' => "Документи СумДУ", 'documents' => $documents, 'top_alert' => $error));
    }
}
