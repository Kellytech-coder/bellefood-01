pipeline {

    agent any

    environment {
        DOCKER_IMAGE = 'kellytechcoder/bellefood-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                deleteDir()

                bat '''
                    git config --global http.version HTTP/1.1
                    git config --global core.compression 0
                '''

                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/Kellytech-coder/bellefood-01.git'
                    ]],
                    extensions: [
                        [$class: 'CloneOption',
                         shallow: true,
                         depth: 1,
                         noTags: true,
                         timeout: 20]
                    ]
                ])
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Build Frontend') {
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

                    bat 'echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin'

                    bat 'docker push %DOCKER_IMAGE%:%IMAGE_TAG%'

                    bat 'docker push %DOCKER_IMAGE%:latest'
                }
            }
        }
    }

    post {

        success {
            echo 'BelleFood frontend deployment completed successfully!'
        }

        failure {
            echo 'BelleFood frontend deployment failed.'
        }

        always {
            echo "Build number: ${BUILD_NUMBER}"
        }
    }
}