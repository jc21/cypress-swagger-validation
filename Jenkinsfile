pipeline {
  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    disableConcurrentBuilds()
  }
  agent any
  stages {
    stage('Build') {
      steps {
        ansiColor('xterm') {
          sh 'docker run --rm -v $(pwd):/app -w /app $DOCKER_NODE npm --registry=https://registry.npmjs.org install'
          sh 'docker run --rm -v $(pwd):/app -w /app $DOCKER_NODE npm run-script build'
        }
      }
    }
  }
  post {
    success {
      ansiColor('xterm') {
        withNPM(npmrcConfig: 'npm-jc21') {
          sh 'docker run --rm -v $(pwd):/app -w /app $DOCKER_NODE npm --registry=https://registry.npmjs.org publish --access public || echo "Skipping publish"'
        }
      }
      juxtapose event: 'success'
      sh 'figlet "SUCCESS"'
    }
    failure {
      juxtapose event: 'failure'
      sh 'figlet "FAILURE"'
    }
  }
}
