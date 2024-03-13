pipeline {
	options {
		buildDiscarder(logRotator(numToKeepStr: '10'))
		disableConcurrentBuilds()
		ansiColor('xterm')
	}
	agent any
	stages {
		stage('Build') {
			steps {
				sh 'docker run --rm -v $(pwd):/app -w /app node:20 yarn --registry=https://registry.npmjs.org install'
				sh 'docker run --rm -v $(pwd):/app -w /app node:20 yarn build'
			}
		}
		stage('Test') {
			steps {
				sh 'docker run --rm -v $(pwd):/app -w /app node:20 yarn --registry=https://registry.npmjs.org install'
				sh 'docker run --rm -v $(pwd):/app -w /app node:20 yarn test'
			}
		}
	}
	post {
		success {
			withNPM(npmrcConfig: 'npm-jc21') {
				sh 'docker run --rm -v $(pwd):/app -w /app node:20 npm --registry=https://registry.npmjs.org publish --access public || echo "Skipping publish"'
			}
			withNPM(npmrcConfig: 'npm-github-jc21') {
				sh 'docker run --rm -v $(pwd):/app -w /app node:20 npm --registry=https://npm.pkg.github.com/ publish --access public || echo "Skipping publish"'
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
			sh 'docker run --rm -v $(pwd):/app -w /app node:20 chown -R $(id -u):$(id -g) *'
		}
	}
}
