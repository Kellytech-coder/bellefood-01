pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'kellytechcoder/bellefood-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Kellytech-coder/bellefood.git'
            }
        }

        stage('Install') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t %DOCKER_IMAGE%:%IMAGE_TAG% .'
                bat 'docker tag %DOCKER_IMAGE%:%IMAGE_TAG% %DOCKER_IMAGE%:latest'
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    bat 'docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%'
                    bat 'docker push %DOCKER_IMAGE%:%IMAGE_TAG%'
                    bat 'docker push %DOCKER_IMAGE%:latest'
                }
            }
        }
    }

    post {
        success {
            echo 'BelleFood frontend deployed successfully.'
        }

        failure {
            echo 'BelleFood frontend deployment failed.'
        }
    }
}