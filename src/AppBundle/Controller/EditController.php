<?php

namespace AppBundle\Controller;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use AppBundle\Entity\Document;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\Config\Definition\Exception\Exception;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;


class EditController extends Controller {

    /**
     * @Route("/edit/{id}", name="edit_document", requirements={"id": "\d+"})
     */
    public function editAction($id) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
        $document = $this->getDoctrine()->getRepository('AppBundle:Document')->find($id);
        return $this->render('document/edit.html.twig', array('page_title' => "Редагування документу", 'document' => $document));
    }

    /**
     * @Route("/edit/new/", name="new_document")
     */
    public function newAction() {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
        $document = new Document();
        return $this->render('document/edit.html.twig', array('page_title' => "Новий документ", 'document' => $document));
    }

    /**
     * @Route("/edit/remove/{id}", name="remove_document", requirements={"id": "\d+"})
     */
    public function removeAction($id) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
        $manager = $this->getDoctrine()->getManager();
        $document = $manager->getRepository('AppBundle:Document')->find($id);

        if (!$document) {
            throw $this->createNotFoundException(
                'No document found for id '.$id
            );
        } else {
            $manager->remove($document);
            $manager->flush();
        }

        return $this->redirectToRoute('homepage');
    }

    /**
     * @Route("/edit/save/", name="save_new_document")
     * @Route("/edit/save/{id}", name="save_document", requirements={"id": "\d+"})
     */
    public function saveAction($id = '') {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
        $request = Request::createFromGlobals();

        $manager = $this->getDoctrine()->getManager();
        $fs = new Filesystem();

        if (!empty($id)) {
            $document = $manager->getRepository('AppBundle:Document')->find($id);

            if (!$document) {
                throw $this->createNotFoundException(
                    'No document found for id '.$id
                );
            }
        } else {
            $document = new Document();
        }

        $name = $request->request->get('document-name');
        $automatization = $request->request->get('document-automatization');
        $date = $request->request->get('document-date');
        $version = $request->request->get('document-version');
        $json = $request->request->get('document-json');
        $template = $request->files->get('document-template');

        if (!empty($name))
            $document->setName($name);

        if(isset($automatization) && is_numeric($automatization)) //Если юзать empty вместо isset, то ДШ не будет применяться, т.к. automatization = 0
            $document->setAutomatization($automatization);

        if(!empty($date))
            $document->setDate($date);

        if(!empty($version))
            $document->setVersion($version);

        if(!empty($json))
            $document->setJson($json);

        if(empty($id))
            $manager->persist($document);

        $manager->flush();

        if(isset($template))
            $fs->copy($template, $this->getParameter('templates_dir') . $document->getId() . '.docx', true);

        return $this->redirectToRoute('homepage');
    }
}

?>