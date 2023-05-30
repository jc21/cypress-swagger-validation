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
          sh 'docker run --rm -v $(pwd):/app -w /app node:18 yarn --registry=https://registry.npmjs.org install'
          sh 'docker run --rm -v $(pwd):/app -w /app node:18 yarn build'
        }
      }
    }
    stage('Test') {
      steps {
        ansiColor('xterm') {
          sh 'docker run --rm -v $(pwd):/app -w /app node:18 yarn --registry=https://registry.npmjs.org install'
          sh 'docker run --rm -v $(pwd):/app -w /app node:18 yarn test'
        }
      }
    }
  }
  post {
    success {
      ansiColor('xterm') {
        withNPM(npmrcConfig: 'npm-jc21') {
          sh 'docker run --rm -v $(pwd):/app -w /app node:18 npm --registry=https://registry.npmjs.org publish --access public || echo "Skipping publish"'
        }
        withNPM(npmrcConfig: 'npm-github-jc21') {
          sh 'docker run --rm -v $(pwd):/app -w /app node:18 npm --registry=https://npm.pkg.github.com/ publish --access public || echo "Skipping publish"'
        }
      }
      juxtapose event: 'success'
      sh 'figlet "SUCCESS"'
    }
    failure {
      juxtapose event: 'failure'
      sh 'figlet "FAILURE"'
    }
    always {
      // Fix file ownership
      sh 'docker run --rm -v $(pwd):/app -w /app node:18 chown -R $(id -u):$(id -g) *'
    }
  }
}
