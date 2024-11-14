pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        SERVICE_NAME = 'quokka-service'
        IMAGE_TAG = "quokka"
        AWS_DEFAULT_REGION = 'ap-northeast-2'
        ECR_REGISTRY = '490004621715.dkr.ecr.ap-northeast-2.amazonaws.com/quokka'
    }

    stages {
        stage('Clone Repository') {
            steps {
                sh 'git clone https://github.com/trip-with-happy-quokka/Quakka-Travel'
                dir('Quakka-Travel') {
                    sh 'git checkout release/v2'
                }
            }
        }

        stage('Prepare Config') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_KEY', variable: 'AWS_SECRET_ACCESS_KEY'),
                    string(credentialsId: 'AWS_DB_MASTER', variable: 'AWS_DB_MASTER'),
                    string(credentialsId: 'AWS_DB_SLAVE', variable: 'AWS_DB_SLAVE'),
                    string(credentialsId: 'AWS_DB_USERNAME', variable: 'AWS_DB_USERNAME'),
                    string(credentialsId: 'AWS_DB_PW', variable: 'AWS_DB_PW'),
                    string(credentialsId: 'AWS_DB_PW_S', variable: 'AWS_DB_PW_S'),
                    string(credentialsId: 'AWS_ELASTIC_SEARCH_ID', variable: 'AWS_ELASTIC_SEARCH_ID'),
                    string(credentialsId: 'AWS_ELK_URL', variable: 'AWS_ELK_URL'),
                    string(credentialsId: 'AWS_ELASTIC_SEARCH_PW', variable: 'AWS_ELASTIC_SEARCH_PW'),
                    string(credentialsId: 'AWS_REDIS_URL', variable: 'AWS_REDIS_URL'),
                    string(credentialsId: 'AWS_S3_BUCKET', variable: 'AWS_S3_BUCKET'),
                    string(credentialsId: 'APP_PASSWORD', variable: 'APP_PASSWORD'),
                    string(credentialsId: 'MAIL_USERNAME', variable: 'MAIL_USERNAME'),
                    string(credentialsId: 'JWT_SECRET_KEY', variable: 'JWT_SECRET_KEY'),
                    string(credentialsId: 'SLACK_WEBHOOK_URL', variable: 'SLACK_WEBHOOK_URL'),
                    string(credentialsId: 'TOSS_PAYMENT_CLIENT_KEY', variable: 'TOSS_PAYMENT_CLIENT_KEY'),
                    string(credentialsId: 'TOSS_PAYMENT_SECRET_KEY', variable: 'TOSS_PAYMENT_SECRET_KEY'),
                    string(credentialsId: 'TOSS_PAYMENT_SUCCESS_URL', variable: 'TOSS_PAYMENT_SUCCESS_URL'),
                    string(credentialsId: 'TOSS_PAYMENT_FAIL_URL', variable: 'TOSS_PAYMENT_FAIL_URL')
                ]) {
                    script {
                        if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_DB_MASTER || !AWS_DB_USERNAME || !AWS_DB_PW) {
                            error("필수 AWS 자격 증명 또는 데이터베이스 정보가 없습니다.")
                        }
                        echo "환경 변수 로드 및 검증 완료"
                    }
                }
            }
        }

        stage('Build') {
            steps {
                dir('Quakka-Travel') {
                    sh '''
                        chmod +x gradlew
                        ./gradlew clean build -x test
                    '''
                }
            }
        }

        stage('ECR Login & Docker Build') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_KEY', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    script {
                        sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                        export AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION

                        # ECR 로그인
                        aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

                        # Docker 이미지 빌드
                        docker build -t $ECR_REGISTRY:$IMAGE_TAG \
                            --build-arg AWS_DB_MASTER=$AWS_DB_MASTER \
                            --build-arg AWS_DB_SLAVE=$AWS_DB_SLAVE \
                            --build-arg AWS_DB_PW=$AWS_DB_PW \
                            --build-arg AWS_DB_PW_S=$AWS_DB_PW_S \
                            --build-arg AWS_ELASTIC_SEARCH_ID=$AWS_ELASTIC_SEARCH_ID \
                            --build-arg AWS_ELK_URL=$AWS_ELK_URL \
                            --build-arg AWS_ELASTIC_SEARCH_PW=$AWS_ELASTIC_SEARCH_PW \
                            --build-arg AWS_REDIS_URL=$AWS_REDIS_URL \
                            --build-arg AWS_S3_BUCKET=$AWS_S3_BUCKET \
                            --build-arg MAIL_USERNAME=$MAIL_USERNAME \
                            --build-arg APP_PASSWORD=$APP_PASSWORD \
                            --build-arg JWT_SECRET_KEY=$JWT_SECRET_KEY \
                            --build-arg SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL \
                            --build-arg TOSS_PAYMENT_CLIENT_KEY=$TOSS_PAYMENT_CLIENT_KEY \
                            --build-arg TOSS_PAYMENT_SECRET_KEY=$TOSS_PAYMENT_SECRET_KEY \
                            --build-arg TOSS_PAYMENT_SUCCESS_URL=$TOSS_PAYMENT_SUCCESS_URL \
                            --build-arg TOSS_PAYMENT_FAIL_URL=$TOSS_PAYMENT_FAIL_URL \
                            Quakka-Travel/
                        '''
                    }
                }
            }
        }

        stage('Push to ECR') {
            steps {
                script {
                    sh '''
                    docker push $ECR_REGISTRY:$IMAGE_TAG
                    '''
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_KEY', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    script {
                        sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                        export AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION

                        aws ecs update-service \
                            --cluster quokka-cluster \
                            --service $SERVICE_NAME \
                            --force-new-deployment \
                            --region $AWS_DEFAULT_REGION
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo """
            ===========================================
            Pipeline Successfully Completed
            Service: ${SERVICE_NAME}
            Image: ${ECR_REGISTRY}:${IMAGE_TAG}
            ===========================================
            """
        }
        failure {
            echo """
            ===========================================
            Pipeline Failed
            Service: ${SERVICE_NAME}
            Stage: ${currentBuild.result}
            ===========================================
            """
        }
        always {
            cleanWs()
        }
    }
}
